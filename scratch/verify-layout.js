import fs from 'fs';
import path from 'path';

const root = 'c:/Users/Omar/Desktop/Nahrir-Site';

function checkFileExists(relPath, shouldExist) {
  const fullPath = path.join(root, relPath);
  const exists = fs.existsSync(fullPath);
  if (exists === shouldExist) {
    console.log(`✅ ${relPath} ${shouldExist ? 'exists' : 'does not exist'} as expected.`);
  } else {
    console.error(`❌ ERROR: Expected ${relPath} to ${shouldExist ? 'exist' : 'not exist'}, but it was ${exists ? 'found' : 'not found'}.`);
    process.exit(1);
  }
}

// 1. File checks
checkFileExists('src/shared/layout/Sidebar.jsx', false);
checkFileExists('src/shared/layout/Header.jsx', true);
checkFileExists('src/shared/layout/Header.css', true);

// 2. Shell.jsx content checks
const shellPath = path.join(root, 'src/shared/layout/Shell.jsx');
const shellContent = fs.readFileSync(shellPath, 'utf8');

if (shellContent.includes('Sidebar')) {
  console.error('❌ ERROR: Shell.jsx still references Sidebar.');
  process.exit(1);
} else {
  console.log('✅ Shell.jsx does not reference Sidebar.');
}

if (shellContent.includes('Header')) {
  console.log('✅ Shell.jsx imports and uses Header.');
} else {
  console.error('❌ ERROR: Shell.jsx does not import Header.');
  process.exit(1);
}

if (shellContent.includes('flex flex-col')) {
  console.log('✅ Shell.jsx uses stacked vertical flex layout.');
} else {
  console.error('❌ ERROR: Shell.jsx does not use flex-col layout.');
  process.exit(1);
}

console.log('\n🎉 ALL LAYOUT CHECKS PASSED SUCCESSFULLY!');
process.exit(0);
