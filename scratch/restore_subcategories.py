import re

html_to_inject = """
<div class="sub-filter-buttons" id="book-covers-sub-filters" style="display: none; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
<button class="sub-filter-btn active" data-subcat="all">All</button>
<button class="sub-filter-btn" data-subcat="business">Business</button>
<button class="sub-filter-btn" data-subcat="childrens">Children's</button>
<button class="sub-filter-btn" data-subcat="crime">Crime</button>
<button class="sub-filter-btn" data-subcat="cooking">Cooking</button>
<button class="sub-filter-btn" data-subcat="educational">Educational</button>
<button class="sub-filter-btn" data-subcat="fantasy">Fantasy</button>
<button class="sub-filter-btn" data-subcat="fitness">Fitness</button>
<button class="sub-filter-btn" data-subcat="historical-fiction">Historical Fiction</button>
<button class="sub-filter-btn" data-subcat="horror">Horror</button>
<button class="sub-filter-btn" data-subcat="mystery">Mystery</button>
<button class="sub-filter-btn" data-subcat="paranormal">Paranormal</button>
<button class="sub-filter-btn" data-subcat="poetry">Poetry</button>
<button class="sub-filter-btn" data-subcat="psychology">Psychology</button>
<button class="sub-filter-btn" data-subcat="religious">Religious</button>
<button class="sub-filter-btn" data-subcat="romance">Romance</button>
<button class="sub-filter-btn" data-subcat="science-fiction">Science Fiction</button>
<button class="sub-filter-btn" data-subcat="spiritual">Spiritual</button>
<button class="sub-filter-btn" data-subcat="technology">Technology</button>
<button class="sub-filter-btn" data-subcat="travel">Travel</button>
<button class="sub-filter-btn" data-subcat="wildlife">Wildlife</button>
</div>
"""

for filename in ['portfolio.html', 'index.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to insert after the end of the <div class="portfolio-filters" ...> block
    # It usually ends with </button>\n</div>
    # Let's find the closing tag of portfolio-filters.
    
    match = re.search(r'(<div class="portfolio-filters".*?</div>)', content, re.DOTALL)
    if match:
        old_block = match.group(1)
        new_block = old_block + "\n" + html_to_inject.strip()
        content = content.replace(old_block, new_block)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected subcategories into {filename}")
    else:
        print(f"Could not find portfolio-filters in {filename}")
