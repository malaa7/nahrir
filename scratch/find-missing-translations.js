import fs from 'fs';
import path from 'path';
import { translations } from '../src/i18n/translations.js';

const root = 'c:/Users/Omar/Desktop/Nahrir-Site';
const definedKeys = new Set(Object.keys(translations.ar));

const tCallRegex = /\bt\(\s*'(.*?)'\s*\)|\bt\(\s*"(.*?)"\s*\)/g;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.js') || f.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

const missingKeys = new Map();

walkDir(path.join(root, 'src'), (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    const key = match[1] || match[2];
    if (key && !definedKeys.has(key)) {
      // Exclude dynamic keys like f.id, f.key, language, theme, etc.
      if (!key.includes('${') && !key.includes('language') && !key.includes('theme') && !key.includes('f.') && !key.includes('item.')) {
        if (!missingKeys.has(key)) {
          missingKeys.set(key, []);
        }
        missingKeys.get(key).push(path.relative(root, filePath));
      }
    }
  }
});

console.log(`Scan completed. Found ${missingKeys.size} missing keys:`);
for (const [key, files] of missingKeys.entries()) {
  console.log(`- "${key}" in files: ${files.join(', ')}`);
}
