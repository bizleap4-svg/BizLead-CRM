const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = getFiles('app/(workspace)').concat(getFiles('components'));

console.log('=== TAB IMPLEMENTATIONS ===');
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('activeTab') || content.includes('setActiveTab') || /className=["'][^"']*tab/i.test(content)) {
    console.log(file);
  }
}

console.log('\n=== MODAL / DRAWER IMPLEMENTATIONS ===');
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (/Modal|Dialog|Drawer|Slideover|Popover/i.test(content) && !file.includes('.test.')) {
    console.log(file);
  }
}
