import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update CATEGORY_KEYWORDS
old_covers_kw = "'covers': ['Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi', 'Thriller', 'Romance', 'Mystery', 'Horror', 'Kindle', 'Ebook', 'Minimalist', 'Typography'],"
new_covers_kw = "'covers': ['Business', \"Children's\", 'Crime', 'Cooking', 'Educational', 'Fantasy', 'Fitness', 'Historical Fiction', 'Horror', 'Mystery', 'Paranormal', 'Poetry', 'Psychology', 'Religious', 'Romance', 'Science Fiction', 'Spiritual', 'Technology', 'Travel', 'Wildlife'],"

content = content.replace(old_covers_kw, new_covers_kw)

# Update HTML card generation to include data-subcat
old_card_gen = """      const cleanImgUrl = imgUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
      
      // Construct card HTML
      const cardHTML = `
<div class="portfolio-card reveal" data-cat="${cat}" data-layout="${layout}" style="">"""

new_card_gen = """      const cleanImgUrl = imgUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
      
      let subcatAttr = '';
      if (cat === 'covers') {
         const validSubcats = {
            'Business': 'business',
            "Children's": 'childrens',
            'Crime': 'crime',
            'Cooking': 'cooking',
            'Educational': 'educational',
            'Fantasy': 'fantasy',
            'Fitness': 'fitness',
            'Historical Fiction': 'historical-fiction',
            'Horror': 'horror',
            'Mystery': 'mystery',
            'Paranormal': 'paranormal',
            'Poetry': 'poetry',
            'Psychology': 'psychology',
            'Religious': 'religious',
            'Romance': 'romance',
            'Science Fiction': 'science-fiction',
            'Spiritual': 'spiritual',
            'Technology': 'technology',
            'Travel': 'travel',
            'Wildlife': 'wildlife'
         };
         const matchingTag = tags.find(t => validSubcats[t]);
         if (matchingTag) {
            subcatAttr = ` data-subcat="${validSubcats[matchingTag]}"`;
         }
      }
      
      // Construct card HTML
      const cardHTML = `
<div class="portfolio-card reveal" data-cat="${cat}" data-layout="${layout}"${subcatAttr} style="">"""

content = content.replace(old_card_gen, new_card_gen)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.html")
