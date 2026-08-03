import re

def clean_aplus(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove A+ Content from Marquee span
    content = re.sub(r'<span data-admin-text="true">A\+ Content</span>', '', content)
    
    # Remove skill tags
    content = re.sub(r'<span class="skill-tag" data-admin-text="true"><i class="fa-solid fa-star"></i> A\+ Content</span>', '', content)
    
    # Remove service card
    content = re.sub(r'(?s)<div class="service-card reveal"[^>]*>.*?A\+ Content Design.*?</div>\s*', '', content)
    
    # Remove the empty aplus marquee container
    content = re.sub(r'(?s)<div class="aplus-marquee-container" style="display: flex;">.*?</div></div></div></div>', '', content)
    
    # Remove from option
    content = re.sub(r'<option>A\+ Content</option>', '', content)
    
    # Remove from footer
    content = re.sub(r'<a href="#" class="" data-admin-text="true">A\+ Content</a>', '', content)
    
    # Remove from keywords
    content = re.sub(r'<meta name="keywords" content="(.*?)A\+ Content Design,\s*(.*?)"', r'<meta name="keywords" content="\1\2"', content)
    
    # Remove A+ testimonials
    content = re.sub(r'(?s)<div class="testimonial-card swiper-slide"[^>]*>.*?Amazon A\+ content layout looks incredible.*?</div>\s*', '', content)
    content = re.sub(r'(?s)<div class="testimonial-card swiper-slide"[^>]*>.*?Superb children\'s book formatting and A\+ content design.*?</div>\s*', '', content)

    # Some testimonials might just be in testimonial-inner not the wrapper
    content = re.sub(r'(?s)<div class="testimonial-inner"[^>]*>.*?Amazon A\+ content layout looks incredible.*?</div>\s*', '', content)
    content = re.sub(r'(?s)<div class="testimonial-inner"[^>]*>.*?Superb children\'s book formatting and A\+ content design.*?</div>\s*', '', content)

    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(content)

clean_aplus('index.html')
print("A+ Content cleaned successfully!")
