import sys

def test_logic(cat, activeSubCat, isMainPage, isEdit, cardCat, cardSubcatStr):
    shouldShow = False
    
    # Mock categoryShowCounts
    categoryShowCounts = {}
    
    if cat == 'all' or cardCat == cat:
        cardSubcats = cardSubcatStr.split(',') if cardSubcatStr else []
        if cat == 'covers' and activeSubCat != 'all' and activeSubCat not in cardSubcats:
            shouldShow = False
        else:
            if (cardCat in ['covers', 'formatting', 'paperback-covers']) and isMainPage and not isEdit:
                shouldShow = False
            else:
                if not isMainPage or isEdit:
                    shouldShow = True
                else:
                    if cat == 'all' and cardCat not in ['covers', 'formatting', 'paperback-covers']:
                        if categoryShowCounts.get(cardCat, 0) < 1:
                            shouldShow = True
                            categoryShowCounts[cardCat] = categoryShowCounts.get(cardCat, 0) + 1
                    else:
                        shouldShow = True
                        
    return shouldShow

print("Testing filters on portfolio page (isMainPage=False, isEdit=False):")
print("Card: covers, horror,crime-fiction")

# Active category: covers, active subcat: all
print("Filter: covers / all ->", test_logic('covers', 'all', False, False, 'covers', 'horror,crime-fiction'))

# Active category: covers, active subcat: horror
print("Filter: covers / horror ->", test_logic('covers', 'horror', False, False, 'covers', 'horror,crime-fiction'))

# Active category: covers, active subcat: crime-fiction
print("Filter: covers / crime-fiction ->", test_logic('covers', 'crime-fiction', False, False, 'covers', 'horror,crime-fiction'))

# Active category: covers, active subcat: romance
print("Filter: covers / romance ->", test_logic('covers', 'romance', False, False, 'covers', 'horror,crime-fiction'))
