import os
import fitz  # PyMuPDF

def extract_pdf_to_images(pdf_path: str, output_dir: str):
    """
    Extracts PDF pages into PNG image files inside the specified output directory.
    """
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    extracted_files = []
    
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        output_path = os.path.join(output_dir, f"page{i+1}.png")
        pix.save(output_path)
        extracted_files.append(output_path)
        print(f"Saved: {output_path}")

    print("Extraction completed!")
    return extracted_files

if __name__ == "__main__":
    sample_pdf = r"sample.pdf"
    target_dir = r"../../frontend/public/sheets"
    if os.path.exists(sample_pdf):
        extract_pdf_to_images(sample_pdf, target_dir)
