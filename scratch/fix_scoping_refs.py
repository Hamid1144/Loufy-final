import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The exact line where renderKeywordPills finishes defining
anchor = "      container.innerHTML = '';"
# But wait, we should just put it after the function ends.
# Better to put it at the very top of DOMContentLoaded but inside it? No, after definition.
# Let's search for "function renderKeywordPills() {" and inject window assignments before it.

anchor = "    function renderKeywordPills() {"
injection = """    window.validSubcats_ref = validSubcats;
    window.CATEGORY_KEYWORDS_ref = CATEGORY_KEYWORDS;
    window.renderKeywordPills_ref = function() { renderKeywordPills(); };
    
    function renderKeywordPills() {"""

content = content.replace(anchor, injection)

# Now fix the save logic to use these references
# Wait, the save logic does:
# if (typeof CATEGORY_KEYWORDS !== 'undefined') { CATEGORY_KEYWORDS['covers'] = dsSubcats.map(s => s.name); }
# I'll just rewrite the save logic to use the global refs!

old_save_logic = """                if (typeof CATEGORY_KEYWORDS !== 'undefined') {
                    CATEGORY_KEYWORDS['covers'] = dsSubcats.map(s => s.name);
                }
                
                if (typeof window.validSubcats !== 'undefined' || typeof validSubcats !== 'undefined') {
                    const targetObj = window.validSubcats || validSubcats;
                    // Clear the object properties without reassignment just in case
                    for (const prop of Object.keys(targetObj)) {
                        delete targetObj[prop];
                    }
                    dsSubcats.forEach(s => targetObj[s.name] = s.slug);
                    if (typeof window.validSubcats !== 'undefined') window.validSubcats = targetObj;
                }
                
                if (typeof renderKeywordPills === 'function') renderKeywordPills();"""

new_save_logic = """                // Use the exposed references from DOMContentLoaded
                if (window.CATEGORY_KEYWORDS_ref) {
                    window.CATEGORY_KEYWORDS_ref['covers'] = dsSubcats.map(s => s.name);
                }
                
                if (window.validSubcats_ref) {
                    const targetObj = window.validSubcats_ref;
                    for (const prop of Object.keys(targetObj)) {
                        delete targetObj[prop];
                    }
                    dsSubcats.forEach(s => targetObj[s.name] = s.slug);
                }
                
                if (window.renderKeywordPills_ref) {
                    window.renderKeywordPills_ref();
                }"""

content = content.replace(old_save_logic, new_save_logic)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Exposed references successfully!")
