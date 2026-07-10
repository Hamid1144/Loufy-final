const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');

const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch) {
    const firstScript = scriptMatch[scriptMatch.length - 2]; // There are 3 scripts now? No, there are 2.
    const scriptContent = firstScript.replace('<script>', '').replace('</script>', '');
    fs.writeFileSync('scratch/test_script1.js', scriptContent);
    console.log("Wrote test_script1.js");
}
