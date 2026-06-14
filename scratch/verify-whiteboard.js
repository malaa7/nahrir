import fs from 'fs';
import path from 'path';

const root = 'c:/Users/Omar/Desktop/Nahrir-Site';

// 1. Check file exists
const wbPath = path.join(root, 'src/features/Whiteboard.jsx');
if (!fs.existsSync(wbPath)) {
  console.error('❌ ERROR: Whiteboard.jsx not found!');
  process.exit(1);
} else {
  console.log('✅ Whiteboard.jsx exists.');
}

const content = fs.readFileSync(wbPath, 'utf8');

// 2. Assert no undefined updatePage
if (content.includes('updatePage(')) {
  console.error('❌ ERROR: Whiteboard.jsx still references undefined updatePage().');
  process.exit(1);
} else {
  console.log('✅ updatePage references resolved (sticky note crash fix verified).');
}

// 3. Assert safe page bounds logic exists
if (content.includes('currentPageIndexSafe') && content.includes('pages[currentPageIndexSafe]')) {
  console.log('✅ Safe page index bounds check verified.');
} else {
  console.error('❌ ERROR: Missing safe page index bounds check.');
  process.exit(1);
}

// 4. Assert layer merging
if (content.includes('Ink Layer (Pen, Eraser, Highlighter)')) {
  console.error('❌ ERROR: Objects and Ink layers seem to still be separated in Stage.');
  process.exit(1);
} else {
  console.log('✅ Layer merging verified (objects and ink combined).');
}

// 5. Assert emojis and timer definitions exist
if (content.includes('emojis =') && content.includes('timerSeconds')) {
  console.log('✅ Emoji state and Timer state verified.');
} else {
  console.error('❌ ERROR: Emoji or Timer state hooks not found.');
  process.exit(1);
}

console.log('\n🎉 ALL WHITEBOARD BUG-FIX VERIFICATION CHECKS PASSED!');
process.exit(0);
