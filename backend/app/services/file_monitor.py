import os
import time
import threading
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent
from sqlalchemy.orm import Session
import logging

from app.services.file_processor import FileProcessorService
from app.core.config import settings

logger = logging.getLogger(__name__)


class ScanFileHandler(FileSystemEventHandler):
    """Handler for file system events in the scan folder"""
    
    def __init__(self, db: Session, uploaded_by: int = None):
        self.db = db
        self.uploaded_by = uploaded_by
        self.processor = FileProcessorService(db)
        self.processed_files = set()
        
    def on_created(self, event):
        """Handle file creation events"""
        if event.is_directory:
            return
            
        try:
            file_path = event.src_path
            filename = os.path.basename(file_path)
            
            # Skip if already processed
            if file_path in self.processed_files:
                return
                
            # Skip encrypted files (they end with .enc)
            if filename.endswith('.enc'):
                return
                
            # Wait for file to be fully written
            self._wait_for_file_completion(file_path)
            
            logger.info(f"New file detected: {filename}")
            
            # Process the file
            try:
                document = self.processor.process_file(file_path, self.uploaded_by)
                self.processed_files.add(file_path)
                logger.info(f"Successfully processed file: {filename} (ID: {document.id})")
            except Exception as e:
                logger.error(f"Failed to process file {filename}: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error in file creation handler: {str(e)}")
    
    def _wait_for_file_completion(self, file_path: str, timeout: int = 30):
        """Wait for file to be fully written"""
        path = Path(file_path)
        if not path.exists():
            return
            
        # Wait for file size to stabilize
        prev_size = -1
        stable_count = 0
        
        for _ in range(timeout):
            try:
                current_size = path.stat().st_size
                if current_size == prev_size:
                    stable_count += 1
                    if stable_count >= 3:  # Size stable for 3 checks
                        return
                else:
                    prev_size = current_size
                    stable_count = 0
                time.sleep(0.5)
            except Exception:
                break
        
        logger.warning(f"File completion timeout for: {file_path}")


class FileMonitorService:
    """Service for monitoring the osm_scan folder for new files"""
    
    def __init__(self, db: Session, uploaded_by: int = None):
        self.db = db
        self.uploaded_by = uploaded_by
        self.observer = None
        self.scan_folder = Path(settings.OSM_SCAN_FOLDER)
        self.is_running = False
        
    def start(self):
        """Start monitoring the scan folder"""
        if self.is_running:
            logger.warning("File monitor is already running")
            return
            
        try:
            # Ensure scan folder exists
            if not self.scan_folder.exists():
                self.scan_folder.mkdir(parents=True, exist_ok=True)
                logger.info(f"Created scan folder: {self.scan_folder}")
            
            # Create observer and handler
            self.observer = Observer()
            event_handler = ScanFileHandler(self.db, self.uploaded_by)
            self.observer.schedule(event_handler, str(self.scan_folder), recursive=False)
            
            # Start observer
            self.observer.start()
            self.is_running = True
            
            logger.info(f"Started file monitor for: {self.scan_folder}")
            
        except Exception as e:
            logger.error(f"Failed to start file monitor: {str(e)}")
            raise
    
    def stop(self):
        """Stop monitoring the scan folder"""
        if not self.is_running:
            return
            
        try:
            if self.observer:
                self.observer.stop()
                self.observer.join()
                self.observer = None
            
            self.is_running = False
            logger.info("Stopped file monitor")
            
        except Exception as e:
            logger.error(f"Error stopping file monitor: {str(e)}")
    
    def process_existing_files(self):
        """Process any existing files in the scan folder"""
        try:
            if not self.scan_folder.exists():
                return
                
            processor = FileProcessorService(self.db)
            
            for file_path in self.scan_folder.iterdir():
                if file_path.is_file() and not file_path.name.endswith('.enc'):
                    try:
                        logger.info(f"Processing existing file: {file_path.name}")
                        document = processor.process_file(str(file_path), self.uploaded_by)
                        logger.info(f"Processed existing file: {file_path.name} (ID: {document.id})")
                    except Exception as e:
                        logger.error(f"Failed to process existing file {file_path.name}: {str(e)}")
                        
        except Exception as e:
            logger.error(f"Error processing existing files: {str(e)}")


def start_file_monitor(db: Session, uploaded_by: int = None) -> FileMonitorService:
    """
    Start the file monitor service
    
    Args:
        db: Database session
        uploaded_by: Optional user ID for uploaded files
        
    Returns:
        FileMonitorService instance
    """
    monitor = FileMonitorService(db, uploaded_by)
    monitor.start()
    
    # Process any existing files
    monitor.process_existing_files()
    
    return monitor
