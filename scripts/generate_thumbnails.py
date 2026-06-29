import os
import json
import subprocess
from internetarchive import upload, Item

# Configuration
IA_IDENTIFIER = "minecraft-seed-finder-thumbnails"
LOCAL_THUMB_DIR = "web/public/thumbnails"

def upload_to_ia():
    print(f"Uploading thumbnails to Internet Archive item: {IA_IDENTIFIER}...")
    
    if not os.path.exists(LOCAL_THUMB_DIR):
        print("No thumbnails directory found. Skipping upload.")
        return

    files = [os.path.join(LOCAL_THUMB_DIR, f) for f in os.listdir(LOCAL_THUMB_DIR) if f.endswith('.webp')]
    
    if not files:
        print("No .webp files found to upload.")
        return

    # Upload files to IA
    # Note: Requires 'ia' CLI to be configured with credentials (ia configure)
    for file_path in files:
        filename = os.path.basename(file_path)
        upload(IA_IDENTIFIER, files=[file_path], metadata={"description": "Seed preview thumbnail"})
        print(f"Uploaded {filename}")

if __name__ == "__main__":
    upload_to_ia()
