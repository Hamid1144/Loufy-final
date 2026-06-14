const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const brainDir = "C:\\Users\\razah\\.gemini\\antigravity\\brain\\85f97f71-7d8b-4ce1-ab1d-ca9cf01d8f73";
const images = [
    "base64_8ffa221224572bbd.webp",
    "base64_c66ccad9a81c5e6f.webp",
    "base64_8d2b98fcd72dccbe.webp",
    "base64_31dcb4482ba62266.webp"
];

console.log("Analyzing image files in Node...");
images.forEach(imgName => {
    const filePath = path.join(brainDir, imgName);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const buffer = fs.readFileSync(filePath);
        const md5 = crypto.createHash('md5').update(buffer).digest('hex');
        console.log(`${imgName}: size=${stats.size} bytes, md5=${md5}`);
    } else {
        console.log(`${imgName} does not exist at ${filePath}`);
    }
});
