const fs = require('fs');

const html = fs.readFileSync('admin.html', 'utf-8');

// Check if portfolioDoc is found by openDashboardSubcatModal
const match = html.match(/window\.openDashboardSubcatModal = function\(\) \{([\s\S]*?)\};/);
if (match) {
    console.log("Function found in admin.html!");
} else {
    console.log("Function NOT found in admin.html!");
}
