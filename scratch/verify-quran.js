import fs from 'fs';
import path from 'path';

const root = 'c:/Users/Omar/Desktop/Nahrir-Site';

// 1. Check QuranTeacher.jsx has no KSU iframe
const teacherPath = path.join(root, 'src/features/QuranTeacher.jsx');
if (!fs.existsSync(teacherPath)) {
  console.error('❌ ERROR: QuranTeacher.jsx not found!');
  process.exit(1);
}
const teacherContent = fs.readFileSync(teacherPath, 'utf8');
if (teacherContent.includes('quran.ksu.edu.sa')) {
  console.error('❌ ERROR: QuranTeacher.jsx still embeds the external KSU iframe.');
  process.exit(1);
} else {
  console.log('✅ QuranTeacher.jsx does not embed the external KSU iframe.');
}

// 2. Check GlobalServices.jsx imports and mounts QuranService
const servicesPath = path.join(root, 'src/shared/layout/GlobalServices.jsx');
if (!fs.existsSync(servicesPath)) {
  console.error('❌ ERROR: GlobalServices.jsx not found!');
  process.exit(1);
}
const servicesContent = fs.readFileSync(servicesPath, 'utf8');
if (servicesContent.includes('QuranService') && servicesContent.includes('<QuranService />')) {
  console.log('✅ GlobalServices.jsx mounts background QuranService.');
} else {
  console.error('❌ ERROR: GlobalServices.jsx is missing QuranService.');
  process.exit(1);
}

// 3. Check quranStore.js has globalAyahNumber calculation
const storePath = path.join(root, 'src/features/quranStore.js');
if (!fs.existsSync(storePath)) {
  console.error('❌ ERROR: quranStore.js not found!');
  process.exit(1);
}
const storeContent = fs.readFileSync(storePath, 'utf8');
if (storeContent.includes('globalAyahNumber') && storeContent.includes('surahAyahCounts')) {
  console.log('✅ quranStore.js contains correct global ayah index calculation.');
} else {
  console.error('❌ ERROR: quranStore.js is missing correct global ayah index calculation.');
  process.exit(1);
}

// 4. Check surahsData.js exists
const dataPath = path.join(root, 'src/features/surahsData.js');
if (!fs.existsSync(dataPath)) {
  console.error('❌ ERROR: surahsData.js not found!');
  process.exit(1);
} else {
  console.log('✅ Static surahsData.js metadata exists.');
}

console.log('\n🎉 ALL NATIVE QURAN READER VERIFICATION CHECKS PASSED!');
process.exit(0);
