const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('portfolio.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "outside-only" });
const document = dom.window.document;
const window = dom.window;

// Setup basic window mock values that script.js expects
window.location = { pathname: '/portfolio.html' };
const isMainPage = false;
const isEdit = false;

// Let's run the exact logic from script.js for category and subcategory filtering
// We will bind the events to the elements manually and test clicks.

// 1. Bind Main category buttons
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    // Clone and replace to simulate the script.js behavior
    const oldBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(oldBtn, btn);
    
    oldBtn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const cat = this.dataset.cat;
        
        const subFilters = document.getElementById('book-covers-sub-filters');
        if (subFilters) {
            if (cat === 'covers') {
                subFilters.style.display = 'flex';
            } else {
                subFilters.style.display = 'none';
            }
        }
        
        const colsVal = parseInt(this.dataset.cols) || ( (cat === 'paperback-covers' || cat === 'formatting') ? 2 : 3 );
        const rowsVal = parseInt(this.dataset.rows) || 0;
        const limit = colsVal * rowsVal;
        let activeCatFilteredCount = 0;

        document.querySelectorAll('.portfolio-grid > .portfolio-card').forEach(card => {
            const cardCat = card.dataset.cat;
            let shouldShow = false;

            if (cat === 'all' || cardCat === cat) {
                const activeSubCatBtn = document.querySelector('.sub-filter-btn.active');
                const activeSubCat = activeSubCatBtn ? activeSubCatBtn.dataset.subcat : 'all';
                if (cat === 'covers' && activeSubCat !== 'all' && card.dataset.subcat !== activeSubCat) {
                    shouldShow = false;
                } else {
                    if ((cardCat === 'covers' || cardCat === 'formatting' || cardCat === 'paperback-covers') && isMainPage && !isEdit) {
                        shouldShow = false;
                    } else {
                        if (!isMainPage || isEdit) {
                            shouldShow = true;
                        }
                    }
                }
            }

            if (shouldShow && !isMainPage && cat !== 'all' && limit > 0) {
                if (activeCatFilteredCount >= limit) {
                    shouldShow = false;
                } else {
                    activeCatFilteredCount++;
                }
            }
            
            if (shouldShow) {
                card.style.display = 'block';
                card.classList.add('active'); // mock reveal observer
            } else {
                card.classList.remove('active');
                card.style.display = 'none';
            }
        });
    });
});

// 2. Bind Subcategory buttons
const subFilterBtns = document.querySelectorAll('.sub-filter-btn');
subFilterBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const activeMainFilter = document.querySelector('.filter-btn.active');
        if (activeMainFilter) activeMainFilter.click();
    });
});

// Let's run a click on default filter (Book Covers)
console.log("--- Initial Page Load (Book Covers filter clicked) ---");
const defaultFilter = document.querySelector('.filter-btn[data-cat="covers"]');
if (defaultFilter) {
    defaultFilter.click();
}

let visibleCovers = Array.from(document.querySelectorAll('.portfolio-grid > .portfolio-card')).filter(c => c.style.display === 'block');
console.log(`Visible covers after default click: ${visibleCovers.length}`);

// Let's click "Cookbooks, Food & Wine"
console.log("\n--- Clicking 'Cookbooks, Food & Wine' subcategory ---");
const cookbooksBtn = Array.from(document.querySelectorAll('.sub-filter-btn')).find(b => b.getAttribute('data-subcat') === 'cookbooks-food-wine');
if (cookbooksBtn) {
    cookbooksBtn.click();
} else {
    console.log("Cookbooks button NOT found!");
}

visibleCovers = Array.from(document.querySelectorAll('.portfolio-grid > .portfolio-card')).filter(c => c.style.display === 'block');
console.log(`Visible covers after cookbooks click: ${visibleCovers.length}`);
visibleCovers.forEach(c => {
    console.log(`  - Title: ${c.querySelector('h3').textContent.trim()}, Subcat: ${c.getAttribute('data-subcat')}, Img: ${c.querySelector('img').src}`);
});

// Let's click "Health & Fitness"
console.log("\n--- Clicking 'Health & Fitness' subcategory ---");
const healthBtn = Array.from(document.querySelectorAll('.sub-filter-btn')).find(b => b.getAttribute('data-subcat') === 'health-fitness');
if (healthBtn) {
    healthBtn.click();
} else {
    console.log("Health button NOT found!");
}

visibleCovers = Array.from(document.querySelectorAll('.portfolio-grid > .portfolio-card')).filter(c => c.style.display === 'block');
console.log(`Visible covers after health click: ${visibleCovers.length}`);
visibleCovers.forEach(c => {
    console.log(`  - Title: ${c.querySelector('h3').textContent.trim()}, Subcat: ${c.getAttribute('data-subcat')}, Img: ${c.querySelector('img').src}`);
});
