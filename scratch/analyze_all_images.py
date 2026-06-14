import re

files = ["index.html", "portfolio.html"]

for filename in files:
    print(f"=== ANALYZING {filename} ===")
    with open(filename, "r", encoding="utf-8") as f:
        html = f.read()
    
    # Find all img tags
    img_tags = re.findall(r'<img[^>]+>', html)
    print(f"Found {len(img_tags)} img tags")
    
    for i, tag in enumerate(img_tags):
        src_match = re.search(r'src="([^"]+)"', tag)
        if src_match:
            src = src_match.group(1)
            is_cloudinary = "cloudinary" in src
            has_auto = "f_auto,q_auto" in src
            
            # Find parent portfolio-card title
            # Search context around this tag
            pos = html.find(tag)
            title = "Unknown"
            if pos != -1:
                # search up to 1500 chars after the tag for h3 title
                context = html[pos:pos+1500]
                h3_match = re.search(r'<h3[^>]*>(.*?)</h3>', context)
                if h3_match:
                    title = h3_match.group(1).strip()
            
            print(f"  {i+1}. Title: {title}")
            print(f"     Src: {src}")
            print(f"     Cloudinary: {is_cloudinary} | has f_auto,q_auto: {has_auto}")
            if not is_cloudinary:
                print("     [WARNING] Non-Cloudinary image!")
            elif not has_auto:
                print("     [WARNING] Cloudinary URL missing f_auto,q_auto optimization!")
        else:
            print(f"  {i+1}. Tag has no src attribute: {tag}")
