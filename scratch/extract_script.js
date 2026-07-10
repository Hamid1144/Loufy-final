const fs = require('fs');

const content = fs.readFileSync('admin.html', 'utf8');

const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch) {
    const lastScript = scriptMatch[scriptMatch.length - 1];
    const scriptContent = lastScript.replace('<script>', '').replace('</script>', '');
    
    fs.writeFileSync('scratch/test_script.js', scriptContent);
    console.log("Wrote test_script.js");
}
