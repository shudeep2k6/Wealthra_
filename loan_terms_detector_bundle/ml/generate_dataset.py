"""
Loan Agreement Terms Dataset Generator
Generates over 1,000 realistic legal loan agreement clauses and sentences
across 15 standard banking and credit categories.
"""

import csv
import os
import random

# Categories required:
# 1. Interest Rate
# 2. EMI
# 3. Loan Tenure
# 4. Processing Fee
# 5. Late Fee
# 6. Foreclosure
# 7. Prepayment
# 8. Insurance
# 9. Hidden Charges
# 10. Penalty
# 11. Credit Score
# 12. Eligibility
# 13. Documentation
# 14. Tax
# 15. Other

DATASET_TEMPLATES = {
    "Interest Rate": [
        "The Borrower agrees to pay interest on the loan facility at a floating rate of {rate}% per annum linked to the Bank's 1-year MCLR.",
        "A fixed annual interest rate of {rate}% shall be applicable for the entire tenure of the loan facility without any reset.",
        "The current applicable rate of interest is {rate}% p.a. comprising the benchmark repo rate of {repo}% plus a credit spread of {spread}%.",
        "The Lender reserves the sole right to revise the interest rate spread by up to {spread}% in the event of any credit rating downgrade.",
        "Interest shall be calculated on the daily reducing balance method at the rate of {rate}% compounded on a monthly basis.",
        "In case of a floating rate loan, the rate of interest shall be reset on an annual basis in accordance with prevailing market benchmarks.",
        "The effective annual percentage rate (APR) is calculated as {rate}% inclusive of all underlying margin spreads and capital charges.",
        "The rate of interest chargeable shall be {rate}% p.a., subject to revision following Reserve Bank of India policy revisions.",
        "Differential interest rate of {rate}% shall be levied during the construction period until final disbursement.",
        "The agreed base lending rate is {rate}% per annum, payable in arrears at the conclusion of each calendar month.",
        "Interest charges will accrue from the exact date of loan disbursement at the rate of {rate}% per annum.",
        "The Borrower shall pay simple interest at {rate}% during the initial moratorium period prior to principal amortization."
    ],
    "EMI": [
        "The equated monthly installment (EMI) payable by the Borrower is fixed at INR {amount} due on the {day}th of every calendar month.",
        "The Borrower shall remit a monthly installment of Rs. {amount} covering principal repayment and accrued monthly interest.",
        "Monthly EMI payments of INR {amount} must be serviced through an active National Automated Clearing House (NACH) mandate.",
        "The initial EMI amount shall be Rs. {amount} per month, subject to adjustment if the interest rate benchmark changes.",
        "The borrower covenants to pay {num_installments} consecutive equated monthly installments of INR {amount} without default.",
        "Each monthly EMI of Rs. {amount} shall be deducted automatically via electronic standing instruction from the designated bank account.",
        "Failure to maintain sufficient funds for the monthly installment of INR {amount} will trigger immediate electronic presentation dishonor.",
        "The calculated EMI for this personal credit facility is fixed at Rs. {amount} payable on the 10th of every repayment cycle.",
        "The Borrower confirms that the monthly EMI commitment of Rs. {amount} does not exceed 50% of verified net monthly disposable income.",
        "Repayment shall be made by way of Equated Monthly Installments of INR {amount} commencing from the month immediately following disbursement.",
        "In the event of partial prepayment, the borrower may choose to reduce the monthly EMI from Rs. {amount} or reduce the tenure.",
        "Pre-EMI interest shall be paid every month until the regular equated monthly installment of Rs. {amount} commences."
    ],
    "Loan Tenure": [
        "The total tenure of the loan facility is sanctioned for a period of {tenure_months} months ({tenure_years} years) from the disbursement date.",
        "The loan shall be repaid over an amortization schedule spanning {tenure_years} years across {tenure_months} monthly installments.",
        "The maximum tenure permitted under this home finance agreement is {tenure_months} months subject to age retirement limits.",
        "The duration of this credit facility is strictly restricted to {tenure_years} years from the execution date of this loan deed.",
        "Any request for tenure extension beyond the contracted {tenure_months} months shall be subject to fresh credit underwriting.",
        "The agreed repayment period is {tenure_months} calendar months, concluding on the formal maturity date.",
        "A moratorium on principal repayment of {tenure_months} months is granted, during which only monthly interest is payable.",
        "The maturity date of the loan facility shall fall exactly {tenure_years} years following the initial drawdown timestamp.",
        "The Borrower may request an adjustment of the remaining {tenure_months} months tenure subject to Bank loan servicing policies.",
        "The loan agreement remains legally binding for a term of {tenure_months} months or until all outstanding obligations are cleared."
    ],
    "Processing Fee": [
        "A non-refundable administrative processing fee of {fee_pct}% of the sanctioned loan amount, subject to a minimum of Rs. {fee_min}, is payable.",
        "The Borrower shall pay an upfront loan processing charge of INR {fee_fixed} plus applicable Goods and Services Tax (GST).",
        "A loan evaluation and administrative processing fee amounting to {fee_pct}% will be deducted directly from the initial disbursement.",
        "The processing fee of Rs. {fee_fixed} covers comprehensive documentation verification, credit appraisal, and legal title scrutiny.",
        "In the event the loan sanction is cancelled by the borrower, the upfront processing fee of INR {fee_fixed} shall remain non-refundable.",
        "An origination fee of {fee_pct}% of the total credit limit shall be charged upon issuance of the formal loan sanction letter.",
        "A one-time file handling and login processing charge of Rs. {fee_fixed} must be paid along with the application form submission.",
        "The Bank levies a sanction processing fee of {fee_pct}% on the gross loan value, payable prior to loan agreement signing."
    ],
    "Late Fee": [
        "A penal interest rate of {penal_rate}% per annum shall be charged on all overdue EMI payments for the exact period of delay.",
        "In case of default in payment of any monthly installment on the due date, a late payment fee of Rs. {late_flat} plus {penal_rate}% p.a. will be levied.",
        "Overdue monthly balances shall attract late payment charges at the rate of {penal_rate}% per month until the default is fully cured.",
        "A late fee of Rs. {late_flat} will be debited to the borrower's loan account for every week the EMI payment remains overdue.",
        "Delayed payment of interest or principal beyond 3 days grace period will incur an overdue penal charge of {penal_rate}% compounded monthly.",
        "A late collection fee of INR {late_flat} shall apply per overdue installment in addition to penal interest at {penal_rate}% p.a.",
        "Persistent payment delay exceeding 30 calendar days shall attract default penal interest of {penal_rate}% above regular interest rates.",
        "Late fee calculation begins automatically at 00:01 AM on the day following the missed monthly payment deadline."
    ],
    "Foreclosure": [
        "A foreclosure charge of {foreclose_rate}% shall be levied on the outstanding principal balance if the loan is closed prematurely.",
        "Foreclosure of fixed-rate loans within the initial 12 months shall incur an exit penalty of {foreclose_rate}% plus applicable statutory taxes.",
        "No foreclosure charges shall be applicable on floating-rate individual term loans as per Reserve Bank of India consumer guidelines.",
        "The Borrower must provide a minimum 15 days written notice requesting full loan foreclosure and payoff quotation calculation.",
        "Early closure and foreclosure of this commercial loan facility will attract a foreclosure compensation levy of {foreclose_rate}%.",
        "Upon full foreclosure, the lender shall release original title deeds within 30 working days from settlement of all dues.",
        "A pre-closure penalty of {foreclose_rate}% will be debited to the settlement statement if closed using third-party balance transfer funds.",
        "The borrower shall pay foreclosure fees equivalent to {foreclose_rate}% of the remaining unpaid principal at the date of payoff."
    ],
    "Prepayment": [
        "Partial prepayment is permitted up to {prepay_pct}% of the outstanding balance once in a financial year without any prepayment penalty.",
        "Any partial prepayment made within the lock-in period of {lock_months} months shall attract a prepayment fee of {prepay_fee}%.",
        "Prepayment shall only be accepted in multiples of Rs. {prepay_min} and will be adjusted first towards overdue charges and then principal.",
        "Individual borrowers servicing floating interest rate advances may make prepayments without any prepayment penalty or lock-in fee.",
        "A minimum threshold of INR {prepay_min} is required for making any advance prepayment against outstanding principal.",
        "The borrower may prepay up to 25% of principal annually; prepayments exceeding this threshold shall attract a {prepay_fee}% fee.",
        "Upon receipt of part-prepayment, the lender will recalculate the amortization schedule and provide a revised repayment table."
    ],
    "Insurance": [
        "The Borrower shall obtain and maintain a comprehensive credit life and disability insurance policy covering 100% of the loan value.",
        "Property mortgaged under this loan facility must be insured against fire, earthquake, and natural calamities with the Bank as sole loss payee.",
        "A mandatory group loan protection insurance premium of INR {ins_premium} shall be debited and added to the principal balance.",
        "The borrower agrees to renew the insurance coverage annually and submit proof of premium payment to the Lender 15 days before expiry.",
        "In the event of permanent disability or death of the borrower, insurance proceeds shall be applied directly to liquidate outstanding debt.",
        "The loan sanction is contingent upon securing adequate loan shield insurance covering the entire tenure of the credit facility.",
        "Failure to renew mandatory collateral insurance shall entitle the Bank to purchase insurance on the borrower's behalf and debit the costs."
    ],
    "Hidden Charges": [
        "An annual administrative account maintenance charge of Rs. {hidden_amt} shall be debited every year on the anniversary date.",
        "A document retrieval and duplicate statement issuance fee of Rs. {hidden_amt} plus taxes shall apply to each physical service request.",
        "A statement of account fee of Rs. {hidden_amt} and interest certificate generation fee of Rs. {hidden_amt_small} shall be levied.",
        "An inspection and collateral re-valuation fee of Rs. {hidden_amt} will be charged to the loan account every 3 years.",
        "A physical ECS/NACH mandate registration swap fee of Rs. {hidden_amt_small} shall be charged for changing the repayment bank account.",
        "Legal verification fee of INR {hidden_amt} and technical valuation fees of INR {hidden_amt} shall be recovered separately.",
        "A loan account reactivation fee of Rs. {hidden_amt} will be applied if the loan account falls into inoperative dormant status.",
        "A CIBIL credit report pull fee of Rs. {hidden_amt_small} will be deducted from the customer's savings account during annual monitoring."
    ],
    "Penalty": [
        "A dishonor penalty of Rs. {bounce_fee} shall be charged for every cheque or NACH debit returned unpaid due to insufficient funds.",
        "Breach of any financial covenant or negative pledge shall attract a liquidated damages penalty of {penalty_rate}% per annum.",
        "In case of unauthorized utilization of loan proceeds for speculative purposes, the Bank may impose a punitive penalty of {penalty_rate}%.",
        "Failure to submit annual income tax returns or financial statements within 90 days will result in a non-compliance penalty of Rs. {penalty_flat}.",
        "A ECS mandate bounce charge of INR {bounce_fee} shall be automatically levied upon each debit rejection by the clearing house.",
        "Any representation or warranty proving to be false or misleading will incur an immediate breach penalty of Rs. {penalty_flat}.",
        "The borrower shall indemnify the Bank for all recovery agency costs, legal counsel fees, and litigation expenses incurred."
    ],
    "Credit Score": [
        "The Borrower's credit score must be at least {credit_score} as reported by CIBIL or Experian at the time of formal underwriting.",
        "The Lender shall report payment performance, defaults, and overdue status to all statutory Credit Information Companies monthly.",
        "Any default exceeding 30 days delinquency will be reported to credit bureaus and may severely impair the borrower's credit rating.",
        "A reduction in the borrower's credit score below {credit_score} grants the Lender the right to demand additional collateral security.",
        "The borrower explicitly authorizes the lender to obtain comprehensive credit bureau reports throughout the currency of the loan.",
        "Periodic automated credit score reviews will be conducted by the bank to assess ongoing risk and exposure health."
    ],
    "Eligibility": [
        "The applicant must demonstrate a verified minimum net monthly salary of Rs. {salary} to qualify for this credit facility.",
        "The total fixed obligation to income ratio (FOIR) of the borrower including all existing debts must not exceed {foir_pct}%.",
        "The borrower must be an Indian citizen aged between 21 and 60 years at the time of loan maturity to satisfy eligibility criteria.",
        "Applicants must possess a minimum of 2 years continuous employment in the current organization or sector to qualify.",
        "Self-employed applicants must show audited financial accounts reflecting net profits for at least {years} consecutive assessment years.",
        "Loan eligibility is determined on the basis of verified cash flows, repayment capacity, and existing debt commitments."
    ],
    "Documentation": [
        "The Borrower shall submit certified copies of PAN Card, Aadhaar Card, utility bills, and 6 months bank account statements.",
        "Original registered title deeds of the mortgaged property must be deposited with the Bank to create an equitable mortgage.",
        "The loan agreement must be stamped with appropriate ad-valorem stamp duty as prescribed by the respective State Stamp Act.",
        "The Borrower shall execute an irrevocable power of attorney in favor of the Bank authorizing enforcement upon default.",
        "A certified salary slip stamped by the employer along with Form 16 must be provided prior to final disbursement release.",
        "The borrower shall execute demand promissory notes and a deed of hypothecation in respect of all financed movable assets."
    ],
    "Tax": [
        "All fees, charges, and statutory penalties mentioned herein are exclusive of Goods and Services Tax (GST) payable at {gst_rate}%.",
        "The Borrower may claim tax deductions on principal repayments under Section 80C and interest payments under Section 24(b) of the IT Act.",
        "Tax deducted at source (TDS) if applicable must be deposited by the borrower and statutory TDS certificates submitted to the Lender.",
        "Any enhancement in statutory stamp duty, GST, or government levies shall be borne entirely by the borrower without exception.",
        "The Lender will issue an annual provisional and final interest certificate for the purpose of claiming income tax exemptions.",
        "All statutory levies and stamp duties payable on this agreement shall be deposited with the competent treasury authority."
    ],
    "Other": [
        "This loan agreement shall be governed by, and construed in all respects in accordance with, the laws of the Republic of India.",
        "Any dispute arising out of or in connection with this agreement shall be resolved through binding arbitration in Mumbai.",
        "The Borrower shall inform the Bank in writing within 14 calendar days of any change in residential address or employment.",
        "The courts having jurisdiction over the branch where the loan was sanctioned shall have exclusive legal jurisdiction.",
        "The Borrower agrees that notices served by electronic mail to the registered email address shall constitute valid legal service.",
        "No waiver by the Bank of any default by the Borrower shall operate as a waiver of any subsequent breach or default.",
        "The provisions of this agreement are severable; invalidity of any clause shall not impair the validity of remaining clauses."
    ]
}

def generate_sentence(category, template):
    rates = ["8.25", "8.75", "9.10", "9.50", "10.25", "10.75", "11.50", "12.00", "13.50", "14.25", "15.00", "16.50", "18.00"]
    repo_rates = ["6.50", "6.25", "6.00", "5.75"]
    spreads = ["1.75", "2.25", "2.75", "3.10", "3.50", "4.00"]
    amounts = ["4,500", "8,250", "12,400", "16,800", "22,500", "28,450", "35,000", "42,800", "55,000", "68,200", "85,000"]
    days = ["1", "5", "7", "10", "15", "20", "25", "28"]
    tenure_m = ["12", "24", "36", "48", "60", "84", "120", "180", "240", "300", "360"]
    tenure_y = ["1", "2", "3", "4", "5", "7", "10", "15", "20", "25", "30"]
    fee_pcts = ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]
    fee_mins = ["1,000", "2,500", "5,000", "7,500"]
    fee_fixed = ["1,500", "2,999", "4,500", "6,000", "10,000"]
    penal_rates = ["18.0", "24.0", "28.0", "30.0", "36.0", "2.0", "3.0"]
    late_flats = ["350", "500", "750", "1,000", "1,200"]
    foreclose_rates = ["2.0", "3.0", "3.5", "4.0", "5.0"]
    prepay_pcts = ["10", "15", "20", "25"]
    prepay_fees = ["1.5", "2.0", "2.5", "3.0"]
    prepay_mins = ["10,000", "25,000", "50,000", "1,00,000"]
    lock_months = ["6", "12", "18", "24"]
    ins_premiums = ["8,500", "15,000", "24,500", "35,000", "52,000"]
    hidden_amts = ["500", "750", "1,200", "1,500", "2,500", "3,500"]
    hidden_small = ["150", "250", "300", "450"]
    bounce_fees = ["450", "500", "650", "750", "1,000"]
    penalty_flats = ["2,000", "5,000", "10,000", "25,000"]
    scores = ["650", "700", "725", "750", "780"]
    salaries = ["25,000", "35,000", "50,000", "75,000", "1,00,000"]
    foir_pcts = ["40", "45", "50", "55", "60"]

    idx = random.randint(0, len(tenure_m) - 1)

    text = template.format(
        rate=random.choice(rates),
        repo=random.choice(repo_rates),
        spread=random.choice(spreads),
        amount=random.choice(amounts),
        day=random.choice(days),
        num_installments=random.choice(["12", "24", "36", "60", "120", "180", "240"]),
        tenure_months=tenure_m[idx],
        tenure_years=tenure_y[idx],
        fee_pct=random.choice(fee_pcts),
        fee_min=random.choice(fee_mins),
        fee_fixed=random.choice(fee_fixed),
        penal_rate=random.choice(penal_rates),
        late_flat=random.choice(late_flats),
        foreclose_rate=random.choice(foreclose_rates),
        prepay_pct=random.choice(prepay_pcts),
        prepay_fee=random.choice(prepay_fees),
        prepay_min=random.choice(prepay_mins),
        lock_months=random.choice(lock_months),
        ins_premium=random.choice(ins_premiums),
        hidden_amt=random.choice(hidden_amts),
        hidden_amt_small=random.choice(hidden_small),
        bounce_fee=random.choice(bounce_fees),
        penalty_rate=random.choice(penal_rates),
        penalty_flat=random.choice(penalty_flats),
        credit_score=random.choice(scores),
        salary=random.choice(salaries),
        foir_pct=random.choice(foir_pcts),
        years=random.choice(["2", "3", "4"]),
        gst_rate="18.0"
    )
    return text

def build_dataset(output_path="ml/loan_terms_dataset.csv", target_count=1200):
    rows = []
    categories = list(DATASET_TEMPLATES.keys())
    per_category = target_count // len(categories) + 10

    for cat in categories:
        templates = DATASET_TEMPLATES[cat]
        for _ in range(per_category):
            tmpl = random.choice(templates)
            # Add slight realistic noise/prefixes/suffixes to enrich vocabulary
            prefix_opts = [
                "",
                "Clause {num}: ",
                "Section {num}.{sub}: ",
                "Special Covenant: ",
                "Terms and Conditions: ",
                "Important Stipulation: ",
                "Mandatory Condition: ",
                "Borrower Undertaking: ",
                "General Obligation: "
            ]
            prefix = random.choice(prefix_opts)
            if "{num}" in prefix:
                prefix = prefix.replace("{num}", str(random.randint(1, 45))).replace("{sub}", str(random.randint(1, 9)))

            sentence = prefix + generate_sentence(cat, tmpl)
            rows.append({"text": sentence, "category": cat})

    # Shuffle dataset
    random.seed(42)
    random.shuffle(rows)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "category"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} samples across {len(categories)} categories into '{output_path}'.")
    return len(rows)

if __name__ == "__main__":
    count = build_dataset()
    print(f"Dataset build complete. Total rows: {count}")
