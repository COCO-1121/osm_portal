import os
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class AESEncryption:
    """AES-256 encryption/decryption utility for scanned documents"""
    
    def __init__(self, encryption_key: str):
        """
        Initialize AES encryption with a hex-encoded key
        
        Args:
            encryption_key: Hex-encoded 32-byte key (64 hex characters)
        """
        self.key = bytes.fromhex(encryption_key)
        if len(self.key) != 32:
            raise ValueError("Encryption key must be 32 bytes (64 hex characters)")
    
    def _generate_iv(self) -> bytes:
        """Generate a random 16-byte initialization vector"""
        return os.urandom(16)
    
    def encrypt_file(self, file_path: str, output_path: str) -> Tuple[str, bytes]:
        """
        Encrypt a file using AES-256-CBC
        
        Args:
            file_path: Path to the file to encrypt
            output_path: Path where encrypted file will be saved
            
        Returns:
            Tuple of (output_path, iv_used)
        """
        try:
            # Read file content
            with open(file_path, 'rb') as f:
                plaintext = f.read()
            
            # Generate IV
            iv = self._generate_iv()
            
            # Create cipher
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv),
                backend=default_backend()
            )
            encryptor = cipher.encryptor()
            
            # Apply PKCS7 padding
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(plaintext) + padder.finalize()
            
            # Encrypt
            ciphertext = encryptor.update(padded_data) + encryptor.finalize()
            
            # Write encrypted file (IV + ciphertext)
            with open(output_path, 'wb') as f:
                f.write(iv + ciphertext)
            
            logger.info(f"Successfully encrypted file: {file_path} -> {output_path}")
            return output_path, iv
            
        except Exception as e:
            logger.error(f"Error encrypting file {file_path}: {str(e)}")
            raise
    
    def decrypt_file(self, encrypted_path: str) -> bytes:
        """
        Decrypt a file using AES-256-CBC
        
        Args:
            encrypted_path: Path to the encrypted file
            
        Returns:
            Decrypted file content as bytes
        """
        try:
            # Read encrypted file
            with open(encrypted_path, 'rb') as f:
                encrypted_data = f.read()
            
            # Extract IV (first 16 bytes)
            iv = encrypted_data[:16]
            ciphertext = encrypted_data[16:]
            
            # Create cipher
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv),
                backend=default_backend()
            )
            decryptor = cipher.decryptor()
            
            # Decrypt
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Remove PKCS7 padding
            unpadder = padding.PKCS7(128).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
            
            logger.info(f"Successfully decrypted file: {encrypted_path}")
            return plaintext
            
        except Exception as e:
            logger.error(f"Error decrypting file {encrypted_path}: {str(e)}")
            raise
    
    def decrypt_file_to_stream(self, encrypted_path: str):
        """
        Decrypt a file and return as a generator for streaming
        
        Args:
            encrypted_path: Path to the encrypted file
            
        Yields:
            Chunks of decrypted data
        """
        try:
            decrypted_data = self.decrypt_file(encrypted_path)
            
            # Yield in chunks for memory efficiency
            chunk_size = 8192  # 8KB chunks
            for i in range(0, len(decrypted_data), chunk_size):
                yield decrypted_data[i:i + chunk_size]
                
        except Exception as e:
            logger.error(f"Error streaming decrypted file {encrypted_path}: {str(e)}")
            raise


def get_encryption_util():
    """Get the encryption utility instance configured from environment"""
    from app.core.config import settings
    
    return AESEncryption(settings.SCAN_ENCRYPTION_KEY)
