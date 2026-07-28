import os
import time
import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.db.session import UploaderSessionLocal as SessionLocal
from app.models.uploader.scanned_document import ScannedDocument

logger = logging.getLogger("osm.scan_service")
logging.basicConfig(level=logging.INFO)


class ScanningService:
    def __init__(self):
        # Determine paths relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
        workspace_root = os.path.abspath(os.path.join(backend_root, ".."))

        self.scan_dir = os.path.join(workspace_root, "osm_scan")
        self.env_path = os.path.join(backend_root, ".env")
        
        # Ensure directory is created and hidden
        self.ensure_scan_dir()

        # Load or generate encryption key
        self.key = self.load_or_generate_key()

    def ensure_scan_dir(self):
        if not os.path.exists(self.scan_dir):
            os.makedirs(self.scan_dir, exist_ok=True)
            logger.info(f"Created dedicated scan folder: {self.scan_dir}")
        
        # Programmatically hide the directory on Windows
        if os.name == 'nt':
            try:
                import ctypes
                FILE_ATTRIBUTE_HIDDEN = 0x02
                ctypes.windll.kernel32.SetFileAttributesW(self.scan_dir, FILE_ATTRIBUTE_HIDDEN)
                logger.info(f"Set hidden attribute on {self.scan_dir}")
            except Exception as e:
                logger.warning(f"Could not set hidden attribute on Windows: {e}")

    def load_or_generate_key(self) -> bytes:
        key_hex = os.getenv("SCAN_ENCRYPTION_KEY")
        if not key_hex:
            # Check if key is defined in .env but not loaded
            if os.path.exists(self.env_path):
                with open(self.env_path, "r") as f:
                    for line in f:
                        if line.strip().startswith("SCAN_ENCRYPTION_KEY="):
                            key_hex = line.split("=", 1)[1].strip()
                            break
            
            if not key_hex:
                # Generate new 256-bit key
                key = AESGCM.generate_key(bit_length=256)
                key_hex = key.hex()
                
                # Append to .env file
                try:
                    with open(self.env_path, "a") as f:
                        f.write(f"\n# AES-256 Encryption Key for Scanned Documents\nSCAN_ENCRYPTION_KEY={key_hex}\n")
                    logger.info("Generated new SCAN_ENCRYPTION_KEY and saved it to backend/.env")
                except Exception as e:
                    logger.error(f"Failed to save encryption key to .env: {e}")
                
            os.environ["SCAN_ENCRYPTION_KEY"] = key_hex

        return bytes.fromhex(key_hex)

    def encrypt_data(self, data: bytes) -> bytes:
        """Encrypts data using AES-256-GCM."""
        aesgcm = AESGCM(self.key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, data, None)
        return nonce + ciphertext

    def decrypt_data(self, encrypted_data: bytes) -> bytes:
        """Decrypts data using AES-256-GCM."""
        if len(encrypted_data) < 12:
            raise ValueError("Invalid encrypted data format")
        nonce = encrypted_data[:12]
        ciphertext = encrypted_data[12:]
        aesgcm = AESGCM(self.key)
        return aesgcm.decrypt(nonce, ciphertext, None)

    async def process_new_files(self):
        """Monitors and processes any new files in the osm_scan folder."""
        # Make sure directory exists
        self.ensure_scan_dir()

        allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".tif"}
        
        try:
            files = os.listdir(self.scan_dir)
        except Exception as e:
            logger.error(f"Error listing scan directory: {e}")
            return

        for filename in files:
            filepath = os.path.join(self.scan_dir, filename)
            
            # Skip directories and already encrypted files
            if os.path.isdir(filepath) or filename.endswith(".enc"):
                continue

            _, ext = os.path.splitext(filename.lower())
            if ext not in allowed_extensions:
                continue

            # Process the file
            try:
                # Give the OS a tiny fraction of time to finish writing the file if it was just copied
                time.sleep(0.5)
                
                with open(filepath, "rb") as f:
                    raw_data = f.read()

                # Encrypt data
                encrypted_data = self.encrypt_data(raw_data)
                
                # Write to encrypted file
                enc_filename = f"{filename}.enc"
                enc_filepath = os.path.join(self.scan_dir, enc_filename)
                with open(enc_filepath, "wb") as f:
                    f.write(encrypted_data)

                # Delete original unencrypted file
                os.remove(filepath)

                # Register in database
                mime_map = {
                    ".pdf": "application/pdf",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".tiff": "image/tiff",
                    ".tif": "image/tiff"
                }
                mime_type = mime_map.get(ext, "application/octet-stream")

                db = SessionLocal()
                try:
                    # Check if already registered
                    existing = db.query(ScannedDocument).filter(ScannedDocument.encrypted_filename == enc_filename).first()
                    if not existing:
                        doc = ScannedDocument(
                            original_filename=filename,
                            encrypted_filename=enc_filename,
                            file_path=enc_filepath,
                            mime_type=mime_type,
                            status="Pending",
                            file_size=len(encrypted_data)
                        )
                        db.add(doc)
                        db.commit()
                        logger.info(f"Successfully encrypted and registered document: {filename} -> {enc_filename}")
                except Exception as db_err:
                    db.rollback()
                    logger.error(f"Database registration failed for {filename}: {db_err}")
                finally:
                    db.close()

            except Exception as file_err:
                logger.error(f"Error processing scan file {filename}: {file_err}")

    def generate_dummy_pdf(self) -> bytes:
        """Generates a valid minimal 1-page PDF for simulation purposes."""
        return (
            b"%PDF-1.4\n"
            b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R >>\nendobj\n"
            b"4 0 obj\n<< /Length 72 >>\n"
            b"stream\n"
            b"BT\n/F1 24 Tf\n100 700 Td\n(Simulated Scanned Document) Tj\n"
            b"100 650 Td\n(Epson DS-530 II Simulation Mode) Tj\nET\n"
            b"endstream\nendobj\n"
            b"xref\n0 5\n0000000000 65535 f\n"
            b"0000000009 00000 n\n"
            b"0000000056 00000 n\n"
            b"0000000111 00000 n\n"
            b"0000000212 00000 n\n"
            b"trailer\n<< /Size 5 /Root 1 0 R >>\n"
            b"startxref\n335\n%%EOF"
        )

    async def trigger_scan(self) -> ScannedDocument:
        """Simulates physical scan by writing a dummy PDF into the folder and processing it."""
        self.ensure_scan_dir()
        
        timestamp = int(time.time())
        filename = f"scan_{timestamp}.pdf"
        filepath = os.path.join(self.scan_dir, filename)

        # Write simulated file
        with open(filepath, "wb") as f:
            f.write(self.generate_dummy_pdf())

        logger.info(f"Simulated Scan: Created raw document {filename} in osm_scan folder")
        
        # Process files immediately
        await self.process_new_files()
        
        # Fetch the newly registered document from the DB
        db = SessionLocal()
        try:
            doc = db.query(ScannedDocument).filter(
                ScannedDocument.original_filename == filename
            ).first()
            return doc
        finally:
            db.close()


# Singleton instance of the scanning service
scan_service = ScanningService()
