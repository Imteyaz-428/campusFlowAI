from pathlib import Path

from fastapi import HTTPException, status



# CONFIGURATION


MAX_TEXT_LENGTH = 100_000

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tiff",
    ".tif",
}

SUPPORTED_PDF_EXTENSIONS = {
    ".pdf",
}



# EXCEPTIONS


class DocumentExtractionError(Exception):
    """
    Raised when document text extraction fails.
    """

    pass



# TEXT LIMIT


def _limit_text(text: str) -> str:
    """
    Normalize extracted text and prevent excessively large
    text from entering the AI pipeline.
    """

    if not text:
        return ""

    text = text.replace("\x00", "")

    text = text.strip()

    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]

    return text



# PDF TEXT EXTRACTION


def _extract_pdf_text(
    file_path: Path,
) -> str:
    """
    Extract text from a normal text-based PDF.

    This handles PDFs where text is already embedded in the file.
    """

    try:
        from pypdf import PdfReader

    except ImportError as exc:
        raise DocumentExtractionError(
            "pypdf is not installed."
        ) from exc

    try:
        reader = PdfReader(
            str(file_path)
        )

        extracted_pages = []

        for page in reader.pages:
            try:
                page_text = page.extract_text()

            except Exception:
                page_text = None

            if page_text:
                extracted_pages.append(
                    page_text
                )

        return _limit_text(
            "\n\n".join(
                extracted_pages
            )
        )

    except Exception as exc:
        raise DocumentExtractionError(
            f"Unable to read PDF: {exc}"
        ) from exc



# IMAGE OCR


def _extract_image_text(
    file_path: Path,
) -> str:
    """
    Extract text from an image using Tesseract OCR.
    """

    try:
        from PIL import Image
        import pytesseract

    except ImportError as exc:
        raise DocumentExtractionError(
            "Pillow and pytesseract are required for image OCR."
        ) from exc

    try:
        image = Image.open(
            file_path
        )

        # Convert to RGB to avoid issues with
        # PNG transparency / unusual image modes.
        if image.mode not in {
            "RGB",
            "L",
        }:
            image = image.convert("RGB")

        text = pytesseract.image_to_string(
            image
        )

        return _limit_text(
            text
        )

    except Exception as exc:
        raise DocumentExtractionError(
            f"Unable to perform OCR on image: {exc}"
        ) from exc



# SCANNED PDF OCR


def _extract_scanned_pdf_text(
    file_path: Path,
) -> str:
    """
    Render PDF pages as images and run OCR.

    PyMuPDF is used because it can render PDF pages without
    requiring a separate Poppler installation.
    """

    try:
        import fitz
        import pytesseract
        from PIL import Image

    except ImportError as exc:
        raise DocumentExtractionError(
            "PyMuPDF, Pillow and pytesseract are required "
            "for scanned PDF OCR."
        ) from exc

    try:
        pdf = fitz.open(
            str(file_path)
        )

        extracted_pages = []

        # Limit pages to prevent accidentally processing
        # extremely large documents.
        max_pages = min(
            len(pdf),
            20,
        )

        for page_number in range(
            max_pages
        ):
            page = pdf.load_page(
                page_number
            )

            # Render at approximately 150 DPI.
            matrix = fitz.Matrix(
                2,
                2,
            )

            pixmap = page.get_pixmap(
                matrix=matrix,
                alpha=False,
            )

            image = Image.frombytes(
                "RGB",
                [
                    pixmap.width,
                    pixmap.height,
                ],
                pixmap.samples,
            )

            page_text = pytesseract.image_to_string(
                image
            )

            if page_text:
                extracted_pages.append(
                    page_text
                )

        pdf.close()

        return _limit_text(
            "\n\n".join(
                extracted_pages
            )
        )

    except Exception as exc:
        raise DocumentExtractionError(
            f"Unable to perform OCR on scanned PDF: {exc}"
        ) from exc



# MAIN EXTRACTION FUNCTION


def extract_document_text(
    file_path: str,
    mime_type: str | None = None,
) -> str:
    """
    Extract readable text from a student document.

    Supported:

        PDF
        JPG
        JPEG
        PNG
        WEBP
        BMP
        TIFF

    Processing strategy:

        PDF
          ↓
        Try embedded text extraction
          ↓
        If little/no text
          ↓
        OCR scanned PDF

        IMAGE
          ↓
        OCR
    """

    path = Path(
        file_path
    )

    # ------------------------------------------------------------
    # FILE EXISTENCE
    # ------------------------------------------------------------

    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found.",
        )

    if not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document path is not a file.",
        )

    extension = path.suffix.lower()

    # ------------------------------------------------------------
    # PDF
    # ------------------------------------------------------------

    if extension in SUPPORTED_PDF_EXTENSIONS:

        text = _extract_pdf_text(
            path
        )

        # If the PDF contains useful embedded text,
        # use it directly.
        if len(text.strip()) >= 20:
            return text

        # Otherwise treat it as a scanned PDF.
        return _extract_scanned_pdf_text(
            path
        )

    # ------------------------------------------------------------
    # IMAGE
    # ------------------------------------------------------------

    if extension in SUPPORTED_IMAGE_EXTENSIONS:

        return _extract_image_text(
            path
        )

    # ------------------------------------------------------------
    # UNSUPPORTED FORMAT
    # ------------------------------------------------------------

    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail=(
            "Unsupported document format. "
            "Supported formats: PDF, JPG, JPEG, PNG, "
            "WEBP, BMP and TIFF."
        ),
    )