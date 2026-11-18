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

const allFiles = getFiles('components').concat(getFiles('app'));
const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;
const rgbRegex = /rgba?\([^)]+\)/g;
const twColorRegex = /\b(bg|text|border)-(white|black|gray-\d+|slate-\d+|zinc-\d+|neutral-\d+)\b/g;

const matches = [];

for (const file of allFiles) {
  // skip ThemeProvider palette definitions and brand logo definitions if they are master definitions
  if (file.includes('ThemeProvider.tsx') || file.includes('BrandTokens.ts') || file.includes('seed.ts')) {
    continue;
  }
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    let m;
    while ((m = hexRegex.exec(line)) !== null) {
      matches.push({ file, line: idx + 1, match: m[0], text: line.trim() });
    }
    while ((m = rgbRegex.exec(line)) !== null) {
      matches.push({ file, line: idx + 1, match: m[0], text: line.trim() });
    }
    while ((m = twColorRegex.exec(line)) !== null) {
      matches.push({ file, line: idx + 1, match: m[0], text: line.trim() });
    }
  });
}

console.log(`Found ${matches.length} occurrences:`);
const byFile = {};
matches.forEach(m => {
  byFile[m.file] = byFile[m.file] || [];
  byFile[m.file].push(m);
});

for (const [file, items] of Object.entries(byFile)) {
  console.log(`\n--- ${file} (${items.length} occurrences) ---`);
  items.slice(0, 10).forEach(i => console.log(`  Line ${i.line}: [${i.match}] ${i.text.substring(0, 80)}`));
  if (items.length > 10) console.log(`  ... and ${items.length - 10} more`);
}
