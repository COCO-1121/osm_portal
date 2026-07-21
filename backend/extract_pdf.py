import os
import fitz

pdf_path = r"C:\Users\DELL\.gemini\antigravity-ide\brain\2d90efe5-5cda-426f-8495-e7961c97a736\media__1784195742539.pdf"
output_dir = r"d:\osm (1)\osm\frontend\public\sheets"

os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    output_path = os.path.join(output_dir, f"page{i+1}.png")
    pix.save(output_path)
    print(f"Saved: {output_path}")

print("Extraction completed!")
