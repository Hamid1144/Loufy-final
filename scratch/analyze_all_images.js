const fs = require('fs');
const path = require('path');

const files = ["index.html", "portfolio.html"];

files.forEach(filename => {
    console.log(`=== ANALYZING ${filename} ===`);
    const filePath = path.join(__dirname, '..', filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Regex to find all img tags
    const imgRegex = /<img[^>]+>/gi;
    const imgTags = html.match(imgRegex) || [];
    console.log(`Found ${imgTags.length} img tags`);
    
    imgTags.forEach((tag, i) => {
        const srcMatch = /src="([^"]+)"/i.exec(tag);
        if (srcMatch) {
            const src = srcMatch[1];
            const isCloudinary = src.includes('cloudinary');
            const hasAuto = src.includes('f_auto,q_auto');
            
            // Find parent portfolio-card title
            const pos = html.indexOf(tag);
            let title = "Unknown";
            if (pos !== -1) {
                const context = html.substring(pos, pos + 1500);
                const h3Match = /<h3[^>]*>([^<]+)<\/h3>/i.exec(context);
                if (h3Match) {
                    title = h3Match[1].trim();
                }
            }
            
            console.log(`  ${i+1}. Title: ${title}`);
            console.log(`     Src: ${src}`);
            console.log(`     Cloudinary: ${isCloudinary} | has f_auto,q_auto: ${hasAuto}`);
            if (!isCloudinary) {
                console.log("     [WARNING] Non-Cloudinary image!");
            } else if (!hasAuto) {
                console.log("     [WARNING] Cloudinary URL missing f_auto,q_auto optimization!");
            }
        } else {
            console.log(`  ${i+1}. Tag has no src attribute: ${tag}`);
        }
    });
});
