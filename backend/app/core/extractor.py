import io
import re
from pathlib import Path
from pypdf import PdfReader
from docx import Document

class DocumentExtractor:
    MAX_FILE_BYTES = 15 * 1024 * 1024  # 15 MB limit

    @staticmethod
    def sanitize_text(text: str) -> str:
        """Sanitize text by removing null bytes, surrogate characters, and excessive whitespace."""
        if not text:
            return ""
        # Remove null bytes and control characters except newline and tab
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        # Normalize multiple spaces and multiple newlines
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    @staticmethod
    def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
        """Extract text from file bytes with edge-case validation."""
        if not file_bytes or len(file_bytes) == 0:
            raise ValueError(f"Uploaded file '{filename}' is empty (0 bytes).")
            
        if len(file_bytes) > DocumentExtractor.MAX_FILE_BYTES:
            raise ValueError(f"File '{filename}' exceeds maximum allowed limit of 15MB.")

        suffix = Path(filename).suffix.lower()
        if suffix == ".pdf":
            raw_text = DocumentExtractor._extract_from_pdf_bytes(file_bytes, filename)
        elif suffix == ".docx":
            raw_text = DocumentExtractor._extract_from_docx_bytes(file_bytes, filename)
        elif suffix in [".txt", ".md"]:
            raw_text = file_bytes.decode("utf-8", errors="replace")
        else:
            raise ValueError(f"Unsupported file format '{suffix}'. Allowed formats: .pdf, .docx, .txt")

        sanitized = DocumentExtractor.sanitize_text(raw_text)
        if not sanitized or len(sanitized.strip()) < 10:
            raise ValueError(f"Document '{filename}' appears empty or could not be parsed into readable text.")
            
        return sanitized

    @staticmethod
    def extract_text_from_path(file_path: Path | str) -> str:
        """Extract text directly from a file path with edge-case validation."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")

        file_bytes = path.read_bytes()
        return DocumentExtractor.extract_text_from_bytes(file_bytes, path.name)

    @staticmethod
    def _extract_from_pdf_bytes(file_bytes: bytes, filename: str) -> str:
        stream = io.BytesIO(file_bytes)
        try:
            reader = PdfReader(stream)
            if reader.is_encrypted:
                try:
                    # Attempt decrypt with empty password for standard protected PDFs
                    reader.decrypt("")
                except Exception:
                    raise ValueError(f"PDF '{filename}' is password protected and cannot be extracted.")

            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text.strip())
            return "\n\n".join(text_parts)
        except Exception as e:
            if "password protected" in str(e).lower():
                raise e
            raise ValueError(f"Failed to read PDF '{filename}': {str(e)}")

    @staticmethod
    def _extract_from_docx_bytes(file_bytes: bytes, filename: str) -> str:
        stream = io.BytesIO(file_bytes)
        try:
            doc = Document(stream)
            return DocumentExtractor._parse_docx_elements(doc)
        except Exception as e:
            raise ValueError(f"Failed to read DOCX document '{filename}': {str(e)}")

    @staticmethod
    def _parse_docx_elements(doc: Document) -> str:
        lines = []
        for p in doc.paragraphs:
            txt = p.text.strip()
            if txt:
                lines.append(txt)
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    lines.append(" | ".join(row_cells))
        return "\n".join(lines)
