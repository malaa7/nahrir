import { translations } from '../src/i18n/translations.js';

const arKeys = Object.keys(translations.ar);
const enKeys = Object.keys(translations.en);

console.log(`Arabic keys count: ${arKeys.length}`);
console.log(`English keys count: ${enKeys.length}`);

const missingInEn = arKeys.filter(k => !enKeys.includes(k));
const missingInAr = enKeys.filter(k => !arKeys.includes(k));

if (missingInEn.length > 0) {
  console.log('\n❌ Keys in Arabic but missing in English:', missingInEn);
} else {
  console.log('\n✅ No keys missing in English.');
}

if (missingInAr.length > 0) {
  console.log('\n❌ Keys in English but missing in Arabic:', missingInAr);
} else {
  console.log('\n✅ No keys missing in Arabic.');
}
