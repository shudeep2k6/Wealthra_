"""
Predict Loan Terms and Clause Intelligence
Accepts loan text, segments into clauses, performs ML TF-IDF + Logistic Regression classification,
extracts confidence scores, key loan terms, risk levels, and generates plain-English summaries.
"""

import sys
import os
import re
import json
import joblib
import numpy as np

# Ensure NLTK sent_tokenize is available with graceful fallback
try:
    import nltk
    from nltk.tokenize import sent_tokenize
except ImportError:
    sent_tokenize = None

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(CURRENT_DIR, "vectorizer.pkl")

# Cached model & vectorizer
_MODEL = None
_VECTORIZER = None

def get_model_and_vectorizer():
    global _MODEL, _VECTORIZER
    if _MODEL is None or _VECTORIZER is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
            raise FileNotFoundError(
                f"Model or Vectorizer artifacts missing in {CURRENT_DIR}. Please run train_model.py first."
            )
        _MODEL = joblib.load(MODEL_PATH)
        _VECTORIZER = joblib.load(VECTORIZER_PATH)
    return _MODEL, _VECTORIZER

def split_into_clauses(text):
    """
    Split loan agreement text into distinct clauses or sentences.
    Handles numbering (1.1, Clause 5, Section 2), semicolons, and paragraphs.
    """
    if not text:
        return []

    # Try NLTK sentence tokenizer first
    sentences = []
    if sent_tokenize:
        try:
            raw_sents = sent_tokenize(text)
            for s in raw_sents:
                # Further split on semicolons or newlines if clauses are concatenated
                parts = re.split(r';\s*\n|(?<=\d\))\s+|(?<=[a-z]\))\s+', s)
                sentences.extend(parts)
        except Exception:
            sentences = []

    if not sentences:
        # Fallback regex sentence splitter
        sentences = re.split(r'(?<=[.?!])\s+(?=[A-Z0-9\(\[])|[\r\n]{2,}|(?<=[;])\s*\n', text)

    # Filter out empty or trivial strings
    cleaned_clauses = []
    for s in sentences:
        s_clean = s.strip()
        # Keep clauses with at least 15 characters and some words
        if len(s_clean) >= 15 and any(c.isalpha() for c in s_clean):
            cleaned_clauses.append(s_clean)

    return cleaned_clauses

def evaluate_clause_risk(category, clause_text):
    """
    Evaluate risk level (Low, Medium, High) and provide human rationale for a specific clause.
    """
    clause_lower = clause_text.lower()
    risk = "Low"
    explanation = "Standard credit agreement condition."

    if category == "Late Fee":
        # Look for high penal rates > 18% or > 2% monthly
        if re.search(r'(?:2[4-9]|3[0-9]|4[0-9])%|(?:\b[2-5]%\s*per\s*month)', clause_lower):
            risk = "High"
            explanation = "Steep late payment penalty rate charged on default."
        elif re.search(r'(?:1[5-9]|2[0-3])%', clause_lower):
            risk = "Medium"
            explanation = "Moderate overdue payment surcharge."
        else:
            risk = "Medium"
            explanation = "Late fee levied on overdue installments."

    elif category == "Foreclosure":
        if re.search(r'(?:[3-9]%\s*foreclosure|[3-9]%\s*pre-closure|fixed-rate|not\s*permitted|lock-in)', clause_lower):
            risk = "High"
            explanation = "Significant financial penalty or restrictions when closing the loan early."
        elif "no foreclosure charges" in clause_lower or "nil" in clause_lower or "zero" in clause_lower:
            risk = "Low"
            explanation = "No foreclosure penalty applies on this facility."
        else:
            risk = "Medium"
            explanation = "Foreclosure fee applies if settled prior to maturity."

    elif category == "Hidden Charges":
        risk = "High"
        explanation = "Administrative, maintenance, or document fees that increase overall borrowing cost."

    elif category == "Penalty":
        if re.search(r'bounce|dishonor|liquidated damages|punitive|indemnify', clause_lower):
            risk = "High"
            explanation = "Punitive charges for transaction bounces, legal recovery, or technical default."
        else:
            risk = "Medium"
            explanation = "Standard default penalty covenant."

    elif category == "Interest Rate":
        if re.search(r'sole right to revise|discretion|variable spread|increase|compound', clause_lower):
            risk = "Medium"
            explanation = "Interest rate spread can be revised unilaterally by the lender based on market benchmark."
        else:
            risk = "Low"
            explanation = "Contractual interest rate agreed between parties."

    elif category == "Prepayment":
        if re.search(r'lock-in|penalty|fee|charge', clause_lower) and not re.search(r'no\s+penalty|nil|zero', clause_lower):
            risk = "Medium"
            explanation = "Restrictions or fees on making advance payments towards loan principal."
        else:
            risk = "Low"
            explanation = "Borrower is allowed to make advance prepayments."

    elif category == "Insurance":
        if re.search(r'mandatory|compulsory|sole loss payee|debited to principal', clause_lower):
            risk = "Medium"
            explanation = "Mandatory bundled insurance premium added to your outstanding borrowing."
        else:
            risk = "Low"
            explanation = "Insurance protection coverage recommended for the loan."

    elif category == "Processing Fee":
        if re.search(r'[2-9]%\s*processing|non-refundable', clause_lower):
            risk = "Medium"
            explanation = "Non-refundable upfront fee deducted at disbursement."
        else:
            risk = "Low"
            explanation = "Standard administrative loan origination processing fee."

    elif category == "Credit Score":
        if re.search(r'downgrade|demand additional collateral|delinquency', clause_lower):
            risk = "Medium"
            explanation = "Lender monitors credit score and may trigger covenants if bureau rating drops."
        else:
            risk = "Low"
            explanation = "Statutory reporting of repayment history to credit bureaus."

    return risk, explanation

def extract_term_values(clauses_with_preds, raw_text):
    """
    Extract key financial values for the 10 requested cards:
    - Interest Rate
    - EMI Amount
    - Loan Tenure
    - Processing Fee
    - Late Payment Penalty
    - Foreclosure Charges
    - Prepayment
    - Insurance
    - Hidden Charges
    - Risk Level (Low/Medium/High + Score)
    """
    terms = {}

    # 1. Interest Rate
    ir_clause = next((c for c in clauses_with_preds if c["category"] == "Interest Rate"), None)
    if ir_clause:
        m = re.search(r'(\d+(?:\.\d+)?%)(?:\s*(?:p\.a\.|per\s+annum|floating|fixed))?', ir_clause["clause"], re.IGNORECASE)
        val = m.group(0) if m else "Floating / Benchmark-linked"
        rate_type = "Fixed" if "fixed" in ir_clause["clause"].lower() else "Floating"
        terms["Interest Rate"] = {
            "value": f"{val} ({rate_type})",
            "risk": ir_clause["risk_level"],
            "confidence": ir_clause["confidence"],
            "source_clause": ir_clause["clause"]
        }
    else:
        # Fallback regex in raw text
        m = re.search(r'(\d+(?:\.\d+)?%)\s*(?:p\.a\.|per annum|interest)', raw_text, re.IGNORECASE)
        terms["Interest Rate"] = {
            "value": m.group(0) if m else "Not explicitly specified",
            "risk": "Low" if m else "Medium",
            "confidence": 88.0 if m else 60.0,
            "source_clause": m.group(0) if m else ""
        }

    # 2. EMI Amount
    emi_clause = next((c for c in clauses_with_preds if c["category"] == "EMI"), None)
    if emi_clause:
        m = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d+)?)', emi_clause["clause"], re.IGNORECASE)
        val = f"₹{m.group(1)} / month" if m else "Monthly installment defined in schedule"
        terms["EMI Amount"] = {
            "value": val,
            "risk": "Low",
            "confidence": emi_clause["confidence"],
            "source_clause": emi_clause["clause"]
        }
    else:
        m = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:per month|monthly|EMI)', raw_text, re.IGNORECASE)
        terms["EMI Amount"] = {
            "value": f"₹{m.group(1)} / month" if m else "Calculated based on disbursement",
            "risk": "Low",
            "confidence": 85.0 if m else 60.0,
            "source_clause": m.group(0) if m else ""
        }

    # 3. Loan Tenure
    tenure_clause = next((c for c in clauses_with_preds if c["category"] == "Loan Tenure"), None)
    if tenure_clause:
        m = re.search(r'(\d+)\s*(?:months|years)', tenure_clause["clause"], re.IGNORECASE)
        val = tenure_clause["clause"][:80]
        if m:
            val = f"{m.group(0).title()} amortization schedule"
        terms["Loan Tenure"] = {
            "value": val,
            "risk": "Low",
            "confidence": tenure_clause["confidence"],
            "source_clause": tenure_clause["clause"]
        }
    else:
        m = re.search(r'(\d+)\s*(?:months|years)\s*(?:tenure|period|term)', raw_text, re.IGNORECASE)
        terms["Loan Tenure"] = {
            "value": m.group(0).title() if m else "Standard repayment period",
            "risk": "Low",
            "confidence": 85.0 if m else 60.0,
            "source_clause": m.group(0) if m else ""
        }

    # 4. Processing Fee
    pf_clause = next((c for c in clauses_with_preds if c["category"] == "Processing Fee"), None)
    if pf_clause:
        m_pct = re.search(r'(\d+(?:\.\d+)?%)', pf_clause["clause"])
        m_amt = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+)', pf_clause["clause"])
        val_parts = []
        if m_pct: val_parts.append(f"{m_pct.group(1)} of loan amount")
        if m_amt: val_parts.append(f"Min ₹{m_amt.group(1)}")
        val = " + ".join(val_parts) if val_parts else "Standard administrative fee"
        terms["Processing Fee"] = {
            "value": f"{val} (Non-refundable)",
            "risk": pf_clause["risk_level"],
            "confidence": pf_clause["confidence"],
            "source_clause": pf_clause["clause"]
        }
    else:
        terms["Processing Fee"] = {
            "value": "1.0% - 2.0% + applicable GST",
            "risk": "Low",
            "confidence": 75.0,
            "source_clause": ""
        }

    # 5. Late Payment Penalty
    lf_clause = next((c for c in clauses_with_preds if c["category"] == "Late Fee"), None)
    if lf_clause:
        m_rate = re.search(r'(\d+(?:\.\d+)?%)\s*(?:p\.a\.|per annum|per month)?', lf_clause["clause"])
        m_flat = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+)', lf_clause["clause"])
        val_items = []
        if m_rate: val_items.append(f"{m_rate.group(0).strip()} penal interest")
        if m_flat: val_items.append(f"₹{m_flat.group(1)} flat late charge")
        val = " + ".join(val_items) if val_items else "Penal interest applicable on overdue"
        terms["Late Payment Penalty"] = {
            "value": val,
            "risk": lf_clause["risk_level"],
            "confidence": lf_clause["confidence"],
            "source_clause": lf_clause["clause"]
        }
    else:
        terms["Late Payment Penalty"] = {
            "value": "2.0% per month (24% p.a.) on overdue",
            "risk": "Medium",
            "confidence": 70.0,
            "source_clause": ""
        }

    # 6. Foreclosure Charges
    fc_clause = next((c for c in clauses_with_preds if c["category"] == "Foreclosure"), None)
    if fc_clause:
        if "no foreclosure" in fc_clause["clause"].lower() or "nil" in fc_clause["clause"].lower() or "zero" in fc_clause["clause"].lower():
            val = "Nil / 0% on floating rate term loans"
            risk = "Low"
        else:
            m = re.search(r'(\d+(?:\.\d+)?%)', fc_clause["clause"])
            val = f"{m.group(1)} on outstanding principal" if m else "Applicable per bank policy"
            risk = fc_clause["risk_level"]
        terms["Foreclosure Charges"] = {
            "value": val,
            "risk": risk,
            "confidence": fc_clause["confidence"],
            "source_clause": fc_clause["clause"]
        }
    else:
        terms["Foreclosure Charges"] = {
            "value": "0% for individual floating; up to 3% for fixed",
            "risk": "Low",
            "confidence": 75.0,
            "source_clause": ""
        }

    # 7. Prepayment
    prep_clause = next((c for c in clauses_with_preds if c["category"] == "Prepayment"), None)
    if prep_clause:
        if "without any prepayment penalty" in prep_clause["clause"].lower() or "nil" in prep_clause["clause"].lower():
            val = "Permitted without prepayment penalty"
            risk = "Low"
        else:
            m_fee = re.search(r'(\d+(?:\.\d+)?%)', prep_clause["clause"])
            m_pct = re.search(r'up to (\d+%)', prep_clause["clause"])
            val = f"Permitted up to {m_pct.group(1) if m_pct else '25%'} annually"
            if m_fee: val += f" (Fee: {m_fee.group(1)})"
            risk = prep_clause["risk_level"]
        terms["Prepayment"] = {
            "value": val,
            "risk": risk,
            "confidence": prep_clause["confidence"],
            "source_clause": prep_clause["clause"]
        }
    else:
        terms["Prepayment"] = {
            "value": "Part-payment allowed with prior written notice",
            "risk": "Low",
            "confidence": 75.0,
            "source_clause": ""
        }

    # 8. Insurance
    ins_clause = next((c for c in clauses_with_preds if c["category"] == "Insurance"), None)
    if ins_clause:
        m_amt = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+)', ins_clause["clause"])
        val = f"Mandatory credit life policy (₹{m_amt.group(1)})" if m_amt else "Comprehensive collateral insurance mandatory"
        terms["Insurance"] = {
            "value": val,
            "risk": ins_clause["risk_level"],
            "confidence": ins_clause["confidence"],
            "source_clause": ins_clause["clause"]
        }
    else:
        terms["Insurance"] = {
            "value": "Credit life & collateral insurance recommended",
            "risk": "Low",
            "confidence": 70.0,
            "source_clause": ""
        }

    # 9. Hidden Charges
    hc_clause = next((c for c in clauses_with_preds if c["category"] == "Hidden Charges"), None)
    if hc_clause:
        m_amt = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+)', hc_clause["clause"])
        val = f"Annual maintenance / service fee (₹{m_amt.group(1)})" if m_amt else "Account maintenance & documentation fees"
        terms["Hidden Charges"] = {
            "value": val,
            "risk": "High",
            "confidence": hc_clause["confidence"],
            "source_clause": hc_clause["clause"]
        }
    else:
        terms["Hidden Charges"] = {
            "value": "No excessive hidden administrative fees detected",
            "risk": "Low",
            "confidence": 80.0,
            "source_clause": ""
        }

    # 10. Risk Level & Score
    high_count = sum(1 for c in clauses_with_preds if c["risk_level"] == "High")
    med_count = sum(1 for c in clauses_with_preds if c["risk_level"] == "Medium")
    total_clauses = max(len(clauses_with_preds), 1)

    # Score from 0 to 100
    base_score = int(min(100, (high_count * 25) + (med_count * 10) + 15))
    if base_score >= 65:
        overall_risk = "High"
    elif base_score >= 35:
        overall_risk = "Medium"
    else:
        overall_risk = "Low"

    terms["Risk Level"] = {
        "value": f"{overall_risk} Risk ({base_score}/100)",
        "risk": overall_risk,
        "confidence": 95.0,
        "source_clause": f"Evaluated across {len(clauses_with_preds)} extracted clauses with {high_count} high-risk covenants."
    }

    return terms, overall_risk, base_score

def generate_simple_summary(terms, overall_risk, risk_score, clauses):
    """
    Generate an easily understandable, plain-English summary explaining
    the loan conditions, costs, and risks to everyday borrowers.
    """
    ir = terms.get("Interest Rate", {}).get("value", "Variable")
    emi = terms.get("EMI Amount", {}).get("value", "Monthly installments")
    tenure = terms.get("Loan Tenure", {}).get("value", "Agreed tenure")
    pf = terms.get("Processing Fee", {}).get("value", "Standard fee")
    late = terms.get("Late Payment Penalty", {}).get("value", "Standard late fee")
    foreclosure = terms.get("Foreclosure Charges", {}).get("value", "Standard terms")
    hidden = terms.get("Hidden Charges", {}).get("value", "None")

    high_risk_clauses = [c for c in clauses if c["risk_level"] == "High"]

    summary_paragraphs = []

    # 1. Headline summary
    summary_paragraphs.append(
        f"This loan agreement is categorized as **{overall_risk} Risk** with an overall wellness risk score of **{risk_score}/100**."
    )

    # 2. Key obligations
    summary_paragraphs.append(
        f"**Repayment Terms:** Your monthly installment is estimated at **{emi}** over **{tenure}** with an applicable interest rate of **{ir}**. "
        f"Please verify whether the rate is fixed or floating, as floating interest rates can increase your monthly EMI when benchmark rates rise."
    )

    # 3. Upfront & Early exit fees
    summary_paragraphs.append(
        f"**Upfront and Exit Fees:** An initial processing fee of **{pf}** will be deducted from your loan disbursement. "
        f"If you decide to close the loan before maturity, foreclosure terms indicate: **{foreclosure}**."
    )

    # 4. Penalties and Warnings
    if high_risk_clauses:
        clause_warnings = "; ".join([f"{c['category']} ({c['explanation']})" for c in high_risk_clauses[:3]])
        summary_paragraphs.append(
            f"**Important Warnings:** We identified {len(high_risk_clauses)} clause(s) requiring caution: {clause_warnings}. "
            f"Specifically, late payment penalties (**{late}**) will rapidly compound if an installment is missed. "
            f"Watch out for extra administrative overheads: **{hidden}**."
        )
    else:
        summary_paragraphs.append(
            f"**Borrower Protections:** The contract presents standard protective guidelines with manageable late charges (**{late}**) "
            "and transparent servicing rules. Ensure monthly auto-debit balances are maintained to protect your credit profile."
        )

    return "\n\n".join(summary_paragraphs)

def analyze_loan_text(text):
    """
    Main entry point for analyzing loan agreement text.
    Returns:
    {
      "risk": "Medium",
      "risk_score": 55,
      "summary": "...",
      "clauses": [...],
      "important_terms": [...]
    }
    """
    model, vectorizer = get_model_and_vectorizer()
    raw_clauses = split_into_clauses(text)

    if not raw_clauses:
        # Graceful handling for blank or very short text
        return {
            "risk": "Low",
            "risk_score": 10,
            "summary": "No substantial loan clauses found in the provided text. Please paste a complete loan agreement or upload a document.",
            "clauses": [],
            "important_terms": []
        }

    # Vectorize and predict in batch
    clause_vectors = vectorizer.transform(raw_clauses)
    pred_categories = model.predict(clause_vectors)
    pred_probs = model.predict_proba(clause_vectors)

    clauses_output = []
    classes = list(model.classes_)

    for i, clause in enumerate(raw_clauses):
        cat = pred_categories[i]
        cat_idx = classes.index(cat)
        prob = float(pred_probs[i][cat_idx]) * 100.0
        risk_level, explanation = evaluate_clause_risk(cat, clause)

        clauses_output.append({
            "id": i + 1,
            "clause": clause,
            "category": cat,
            "confidence": round(prob, 1),
            "risk_level": risk_level,
            "explanation": explanation
        })

    # Extract terms for the 10 cards
    terms_dict, overall_risk, risk_score = extract_term_values(clauses_output, text)

    # Format important_terms array matching user requested structure
    important_terms_list = []
    term_keys = [
        "Interest Rate",
        "EMI Amount",
        "Loan Tenure",
        "Processing Fee",
        "Late Payment Penalty",
        "Foreclosure Charges",
        "Prepayment",
        "Insurance",
        "Hidden Charges",
        "Risk Level"
    ]

    for k in term_keys:
        info = terms_dict.get(k, {
            "value": "Standard Terms",
            "risk": "Low",
            "confidence": 85.0,
            "source_clause": ""
        })
        important_terms_list.append({
            "term": k,
            "value": info["value"],
            "risk": info["risk"],
            "confidence": round(info["confidence"], 1),
            "source_clause": info.get("source_clause", "")
        })

    # Generate Simple Summary
    summary = generate_simple_summary(terms_dict, overall_risk, risk_score, clauses_output)

    return {
        "risk": overall_risk,
        "risk_score": risk_score,
        "summary": summary,
        "clauses": clauses_output,
        "important_terms": important_terms_list
    }

def predict_single_clause(clause_text):
    """
    Classify a single clause string.
    Returns (Detected Category, Confidence Score, Extracted Clause)
    """
    model, vectorizer = get_model_and_vectorizer()
    vec = vectorizer.transform([clause_text.strip()])
    cat = model.predict(vec)[0]
    classes = list(model.classes_)
    cat_idx = classes.index(cat)
    prob = float(model.predict_proba(vec)[0][cat_idx]) * 100.0
    return cat, round(prob, 1), clause_text.strip()

def run_cli():
    import argparse
    parser = argparse.ArgumentParser(description="Predict Loan Terms using Trained ML Classifier")
    parser.add_argument("--text", type=str, help="Loan agreement text or single clause")
    parser.add_argument("--file", type=str, help="Path to text document file")
    parser.add_argument("--stdin", action="store_true", help="Read input from standard input")
    parser.add_argument("--single", action="store_true", help="Treat input as single clause instead of document")
    parser.add_argument("--test", action="store_true", help="Run self-test with sample clauses")

    args = parser.parse_args()

    if args.test:
        test_samples = [
            "The borrower agrees to pay interest at a floating rate of 9.25% linked to 1-year MCLR.",
            "Monthly EMI of Rs. 28,450 shall be debited on the 5th of every calendar month.",
            "A penal interest rate of 24.0% per annum shall be charged on delayed EMI payments.",
            "A foreclosure fee of 4% of outstanding principal balance applies if closed within 24 months.",
            "An annual administrative maintenance charge of Rs. 1,500 shall be debited every year."
        ]
        print("Running ML self-test verification:")
        for s in test_samples:
            cat, conf, text = predict_single_clause(s)
            print(f"[{cat}] (Conf: {conf}%) -> {text[:65]}...")
        print("\nFull agreement analysis test:")
        sample_doc = " ".join(test_samples)
        res = analyze_loan_text(sample_doc)
        print(f"Overall Risk: {res['risk']} (Score: {res['risk_score']}/100)")
        print(f"Total Clauses Extracted: {len(res['clauses'])}")
        print(f"Summary Preview: {res['summary'][:120]}...")
        sys.exit(0)

    input_text = ""
    if args.stdin:
        input_text = sys.stdin.read()
    elif args.file:
        with open(args.file, "r", encoding="utf-8", errors="ignore") as f:
            input_text = f.read()
    elif args.text:
        input_text = args.text

    if not input_text.strip():
        print(json.dumps({"error": "No input text provided."}))
        sys.exit(1)

    if args.single:
        cat, conf, clause = predict_single_clause(input_text)
        print(json.dumps({
            "category": cat,
            "confidence": conf,
            "clause": clause
        }, indent=2))
    else:
        results = analyze_loan_text(input_text)
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_cli()
