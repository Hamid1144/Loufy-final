
const fs = require("fs");
let html = fs.readFileSync("index.html", "utf8");

function removeAplus(html) {
    let result = html;
    while (true) {
        let index = result.indexOf("data-cat=\"a-plus-content\"");
        if (index === -1) break;

        let start = result.lastIndexOf("<", index);
        let tagMatch = result.substring(start).match(/^<(\w+)/);
        if (!tagMatch) break;
        let tagName = tagMatch[1];
        
        let divCount = 1;
        let pos = start + 1;
        let foundEnd = false;
        
        while (pos < result.length) {
            let nextOpen = result.indexOf("<" + tagName, pos);
            let nextClose = result.indexOf("</" + tagName, pos);
            
            if (nextClose === -1) break;
            
            if (nextOpen !== -1 && nextOpen < nextClose) {
                let nextChar = result[nextOpen + tagName.length + 1];
                if (nextChar === " " || nextChar === ">") {
                    divCount++;
                    pos = nextOpen + 1;
                } else {
                    pos = nextOpen + 1;
                }
            } else {
                let nextChar = result[nextClose + tagName.length + 2];
                if (nextChar === " " || nextChar === ">") {
                    divCount--;
                    if (divCount === 0) {
                        foundEnd = true;
                        pos = result.indexOf(">", nextClose) + 1;
                        break;
                    }
                    pos = nextClose + 1;
                } else {
                    pos = nextClose + 1;
                }
            }
        }
        
        if (foundEnd) {
            while (result[pos] === "\n" || result[pos] === "\r" || result[pos] === " ") {
                pos++;
            }
            result = result.substring(0, start) + result.substring(pos);
        } else {
            console.log("Could not find end for", tagName, "at index", start);
            break;
        }
    }
    return result;
}

let cleaned = removeAplus(html);
fs.writeFileSync("index.html", cleaned);
console.log("Done");

