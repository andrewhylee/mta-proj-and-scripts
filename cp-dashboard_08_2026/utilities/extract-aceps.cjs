const path = require('path');
const fs = require('fs');

const inputFilePath = path.resolve(__dirname, '../src/data/budget-overview.json');
const outputFilePath = path.resolve(__dirname, '../public/data/aceps-lookup.csv');
// load json from inputFilePath
const rawData = fs.readFileSync(inputFilePath, 'utf-8');
const acepsData = JSON.parse(rawData);

function extractAceps(data) {    
    const aceps = [];
    aceps.push('code,description');
    function recurse(item) {
        if (item.needs_code && item.needs_code.length !== 0) {
            const desc = (item.description || '').replace(/"/g, "'");
            aceps.push(
                `${item.code},"${desc}"`
            );
        }
        if (item.children) {
            item.children.forEach(recurse);
        }
    }
    data.forEach(recurse);
    return aceps;
}

const aceps = extractAceps(acepsData);
fs.writeFileSync(outputFilePath, aceps.join('\n'), 'utf-8');

module.exports = { aceps };

// allow this to run as node script
if (require.main === module) {
    console.log(aceps);
}
