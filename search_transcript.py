import re

path = 'C:/Users/razah/.gemini/antigravity/brain/aba73f00-27c9-436d-928c-d9f8448f8e80/.system_generated/logs/transcript.jsonl'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'href=\\?"(https?://[^"\\]+)"\\?[^>]*data-social', content)
print("Found links matching href/data-social style 1:", set(matches))

matches2 = re.findall(r'data-social="[^"]+"\s+href="([^"]+)"', content)
print("Found links matching href/data-social style 2:", set(matches2))

# Find any URL in the file containing facebook, instagram, linkedin, tiktok
urls = re.findall(r'(https?://(?:www\.)?(?:instagram|facebook|linkedin|tiktok|twitter)\.com/[^\s"\'\\]+)', content)
print("All social URLs found in transcript:", set(urls))
