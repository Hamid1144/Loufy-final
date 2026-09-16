const fs = require('fs');

function removeCard(file, urlMatch) {
    let html = fs.readFileSync(file, 'utf8');
    
    let startIndex = html.indexOf('<div class="portfolio-card website-card reveal" data-cat="websites" data-layout="full-width" data-website-url="' + urlMatch + '"');
    if (startIndex === -1) {
        console.log("Could not find card in " + file);
        return;
    }
    
    let openDivs = 0;
    let endIndex = -1;
    let i = startIndex;
    
    while (i < html.length) {
        if (html.substr(i, 4) === '<div') {
            openDivs++;
            i += 4;
        } else if (html.substr(i, 6) === '</div>') {
            openDivs--;
            if (openDivs === 0) {
                endIndex = i + 6;
                break;
            }
            i += 6;
        } else {
            i++;
        }
    }
    
    if (endIndex !== -1) {
        while (html[endIndex] === '\n' || html[endIndex] === '\r' || html[endIndex] === ' ') {
            endIndex++;
        }
        html = html.substring(0, startIndex) + html.substring(endIndex);
        fs.writeFileSync(file, html, 'utf8');
        console.log("Successfully removed card from " + file);
    } else {
        console.log("Failed to find end of card in " + file);
    }
}

removeCard('index.html', 'https://carolannbradley.vercel.app/');
removeCard('portfolio.html', 'https://carolannbradley.vercel.app/');
