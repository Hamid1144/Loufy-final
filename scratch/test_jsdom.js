const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const htmlContent = fs.readFileSync('scratch/portfolio_html.html', 'utf8');
const dom = new JSDOM(htmlContent);
const tempDoc = dom.window.document;

const btns = tempDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
console.log("Found buttons:", btns.length);
if (btns.length > 0) {
    btns.forEach(b => {
        console.log(" -", b.textContent.trim(), b.getAttribute('data-subcat'));
    });
}
