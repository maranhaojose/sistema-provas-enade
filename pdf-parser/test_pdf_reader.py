"""
PDF Reader & Extractor Test Script.

Validates reading, metadata extraction, and text parsing from ENADE and general PDF documents
using PyMuPDF (fitz) as the primary engine and pdfplumber as secondary.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any, Dict


def read_with_pymupdf(file_path: Path) -> Dict[str, Any]:
    """
    Extracts metadata and text sample from PDF using PyMuPDF (fitz).
    PyMuPDF is optimized for C-level speed and robust text/block extraction.
    """
    try:
        import pymupdf
    except ImportError as err:
        raise RuntimeError("PyMuPDF is not installed. Run: pip install pymupdf") from err

    doc = pymupdf.open(file_path)
    total_pages = len(doc)
    metadata = doc.metadata or {}

    pages_sample: list[dict[str, Any]] = []
    # Read first 3 pages as sample
    for page_idx in range(min(3, total_pages)):
        page = doc[page_idx]
        text = page.get_text()
        blocks = page.get_text("blocks")
        pages_sample.append({
            "page_number": page_idx + 1,
            "char_count": len(text),
            "block_count": len(blocks),
            "preview": text[:200].replace("\n", " ").strip()
        })

    doc.close()

    return {
        "engine": "PyMuPDF",
        "file_name": file_path.name,
        "total_pages": total_pages,
        "title": metadata.get("title", ""),
        "author": metadata.get("author", ""),
        "pages_sample": pages_sample
    }


def read_with_pdfplumber(file_path: Path) -> Dict[str, Any]:
    """
    Extracts text sample from PDF using pdfplumber.
    Useful for comparing layout-specific tables and coordinate data.
    """
    try:
        import pdfplumber
    except ImportError as err:
        raise RuntimeError("pdfplumber is not installed. Run: pip install pdfplumber") from err

    with pdfplumber.open(file_path) as pdf:
        total_pages = len(pdf.pages)
        pages_sample: list[dict[str, Any]] = []

        for page_idx in range(min(3, total_pages)):
            page = pdf.pages[page_idx]
            text = page.extract_text() or ""
            pages_sample.append({
                "page_number": page_idx + 1,
                "char_count": len(text),
                "preview": text[:200].replace("\n", " ").strip()
            })

    return {
        "engine": "pdfplumber",
        "file_name": file_path.name,
        "total_pages": total_pages,
        "pages_sample": pages_sample
    }


def find_default_pdf() -> Path:
    """Finds a candidate PDF file in parent or project directories for verification."""
    search_dirs = [
        Path("."),
        Path(".."),
        Path("../..")
    ]
    for directory in search_dirs:
        for candidate in directory.glob("*.pdf"):
            if candidate.is_file():
                return candidate.resolve()

    raise FileNotFoundError("No PDF file found for automated verification. Please supply one via argument.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Test PDF reading with PyMuPDF and pdfplumber.")
    parser.add_argument("pdf_path", nargs="?", help="Path to PDF file to test.")
    parser.add_argument("--engine", choices=["pymupdf", "pdfplumber", "both"], default="both",
                        help="Engine to use for extraction (default: both).")
    args = parser.parse_args()

    target_pdf = Path(args.pdf_path).resolve() if args.pdf_path else find_default_pdf()

    if not target_pdf.exists():
        print(f"Error: Target PDF file does not exist: {target_pdf}", file=sys.stderr)
        return 1

    print(f"==================================================")
    print(f"Testing PDF Reading Pipeline")
    print(f"Target file: {target_pdf}")
    print(f"File size: {target_pdf.stat().st_size / 1024:.2f} KB")
    print(f"==================================================\n")

    if args.engine in ("pymupdf", "both"):
        print("[1/2] Testing PyMuPDF (Primary Engine)...")
        try:
            mupdf_result = read_with_pymupdf(target_pdf)
            print(f"  ✓ Success!")
            print(f"  - Total Pages: {mupdf_result['total_pages']}")
            print(f"  - Document Title: {mupdf_result['title'] or '(not set)'}")
            for sample in mupdf_result["pages_sample"]:
                print(f"    * Page {sample['page_number']}: {sample['char_count']} chars, {sample['block_count']} text blocks")
                print(f"      Preview: {sample['preview'][:100]}...")
        except Exception as exc:
            print(f"  ✗ PyMuPDF failed: {exc}", file=sys.stderr)
            return 1

    print()

    if args.engine in ("pdfplumber", "both"):
        print("[2/2] Testing pdfplumber (Secondary Engine)...")
        try:
            plumber_result = read_with_pdfplumber(target_pdf)
            print(f"  ✓ Success!")
            print(f"  - Total Pages: {plumber_result['total_pages']}")
            for sample in plumber_result["pages_sample"]:
                print(f"    * Page {sample['page_number']}: {sample['char_count']} chars")
                print(f"      Preview: {sample['preview'][:100]}...")
        except Exception as exc:
            print(f"  ✗ pdfplumber failed: {exc}", file=sys.stderr)
            return 1

    print("\n✓ PDF extraction test completed successfully for all selected engines!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
