import fs from 'fs';
import axios from 'axios';

async function fetchSurahs() {
  try {
    console.log('Fetching surah list from api.alquran.cloud...');
    const response = await axios.get('https://api.alquran.cloud/v1/surah');
    const surahs = response.data.data.map(s => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.revelationType
    }));

    const fileContent = `// Static metadata for the 114 Surahs of the Holy Quran
export const surahsData = ${JSON.stringify(surahs, null, 2)};
`;

    fs.writeFileSync('src/features/surahsData.js', fileContent, 'utf8');
    console.log('Successfully wrote src/features/surahsData.js');
  } catch (error) {
    console.error('Error fetching surahs:', error.message);
    process.exit(1);
  }
}

fetchSurahs();
