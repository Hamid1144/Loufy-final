import os
from PIL import Image
import hashlib

brain_dir = r"C:\Users\razah\.gemini\antigravity\brain\85f97f71-7d8b-4ce1-ab1d-ca9cf01d8f73"
images = [
    "base64_8ffa221224572bbd.webp",
    "base64_c66ccad9a81c5e6f.webp",
    "base64_8d2b98fcd72dccbe.webp",
    "base64_31dcb4482ba62266.webp"
]

print("Analyzing images...")
for img_name in images:
    path = os.path.join(brain_dir, img_name)
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"{img_name}: format={img.format}, size={img.size}, mode={img.mode}")
            # Compute a hash of the pixel data to see if any are identical
            pixels = list(img.getdata())
            # Convert pixels to string and hash
            p_hash = hashlib.md5(str(pixels).encode('utf-8')).hexdigest()
            print(f"  Pixel MD5 Hash: {p_hash}")
    else:
        print(f"{img_name} does not exist at {path}")
