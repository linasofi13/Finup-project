import os
import tempfile
import shutil
import uuid
from pathlib import Path

# Mock Supabase Storage Client
class MockSupabaseStorage:
    def __init__(self):
        # Create a temp directory to store files
        self.storage_dir = Path(tempfile.gettempdir()) / "finup_storage"
        self.storage_dir.mkdir(exist_ok=True)
        print(f"Using mock storage at {self.storage_dir}")
        
        # Base URL for generating public URLs (would be your domain in production)
        self.base_url = "http://localhost:8000/storage"
    
    async def upload(self, path, file_content, options=None):
        try:
            # Create directories if they don't exist
            full_path = self.storage_dir / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            with open(full_path, "wb") as f:
                f.write(file_content)
                
            return MockResponse({"path": str(path)}, None)
        except Exception as e:
            return MockResponse(None, str(e))
    
    def get_public_url(self, path):
        # Generate a mock URL
        return MockUrlResult(f"{self.base_url}/{path}")
    
    def remove(self, path):
        try:
            full_path = self.storage_dir / path
            if full_path.exists():
                os.remove(full_path)
            return MockResponse({"success": True}, None)
        except Exception as e:
            return MockResponse(None, str(e))


# Helper classes for responses
class MockResponse:
    def __init__(self, data, error):
        self.data = data
        self.error = error


class MockUrlResult:
    def __init__(self, public_url):
        self.publicUrl = public_url


# Create a mock instance for use throughout the app
finup_bucket = MockSupabaseStorage() 