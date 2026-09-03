from io import BytesIO
import os

import pytesseract
from PIL import Image, ImageOps, ImageEnhance


def configure_tesseract() -> None:
    """
    Configure Tesseract executable path if TESSERACT_CMD
    is provided in the environment.
    """
    tesseract_cmd = os.getenv("TESSERACT_CMD")

    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Perform basic preprocessing to improve OCR quality.
    """
    image = image.convert("L")

    image = ImageOps.autocontrast(image)

    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.5)

    return image


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extract text from image bytes using Tesseract OCR.

    Raises:
        ValueError: If no readable text is detected.
        RuntimeError: If OCR itself fails.
    """
    try:
        configure_tesseract()

        image = Image.open(BytesIO(image_bytes))

        processed_image = preprocess_image(image)

        text = pytesseract.image_to_string(
            processed_image,
            config="--psm 6",
        )

        text = clean_ocr_text(text)

        if not text:
            raise ValueError(
                "No readable text was detected in the image."
            )

        return text

    except ValueError:
        raise

    except Exception as exc:
        raise RuntimeError(
            f"OCR processing failed: {exc}"
        ) from exc


def clean_ocr_text(text: str) -> str:
    """
    Clean OCR output while preserving useful message content.
    """
    lines = []

    for line in text.splitlines():
        line = " ".join(line.split())

        if line:
            lines.append(line)

    return "\n".join(lines)