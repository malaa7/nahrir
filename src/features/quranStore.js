import { create } from 'zustand';
import axios from 'axios';

const useQuranStore = create((set, get) => ({
    isPlaying: false,
    currentSurah: 1,
    currentAyah: 1,
    reciter: 'ar.alafasy',
    translationLang: 'en.sahih',
    audioUrl: '',
    playMode: 'continuous', // 'single' or 'continuous'
    surahInfo: null,

    // Actions
    setPlaying: (playing) => set({ isPlaying: playing }),
    setSurah: (surah) => set({ currentSurah: surah, currentAyah: 1 }),
    setAyah: (ayah) => set({ currentAyah: ayah }),
    setReciter: (reciter) => set({ reciter }),
    setPlayMode: (mode) => set({ playMode: mode }),
    setSurahInfo: (info) => set({ surahInfo: info }),

    fetchAudio: async () => {
    const { currentSurah, currentAyah, reciter } = get();

    const folderMap = {
    'ar.husarymuallim': 'Husary_Muallim_128kbps',
    'ar.minshawimuallim': 'Minshawy_Teacher_128kbps',
    'ar.abdulbasitmujawwad': 'Abdul_Basit_Mujawwad_128kbps',
    'ar.yasser_aldosari': 'Yasser_Ad-Dussary_128kbps',
    'ar.nasser_alqatami': 'Nasser_Alqatami_128kbps',
    'ar.abdullaahawwaad': 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    'ar.alafasy': 'Alafasy_128kbps',
    'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_64kbps',
    'ar.husary': 'Husary_128kbps',
    'ar.husarymujawwad': 'Husary_Mujawwad_64kbps',
    'ar.minshawi': 'Minshawy_Murattal_128kbps',
    'ar.minshawimujawwad': 'Minshawy_Mujawwad_192kbps',
    'ar.shaatree': 'Abu_Bakr_Ash-Shaatree_128kbps',
    'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
    'ar.mahermuaiqly': 'Maher_AlMuaiqly_64kbps',
    'ar.ahmedajamy': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    'ar.hanirifai': 'Hani_Rifai_192kbps',
    'ar.muhammadjibreel': 'Muhammad_Jibreel_128kbps',
    'ar.saoodshuraym': 'Saood_ash-Shuraym_128kbps'
    };

    const s = String(currentSurah).padStart(3, '0');
    const a = String(currentAyah).padStart(3, '0');

    // Calculate global ayah index (1 to 6236)
    const surahAyahCounts = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];
    let globalAyah = 0;
    for (let i = 0; i < currentSurah - 1; i++) {
      globalAyah += surahAyahCounts[i];
    }
    const globalAyahNumber = globalAyah + currentAyah;

    let url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalAyahNumber}.mp3`;

    if (folderMap[reciter]) {
    url = `https://everyayah.com/data/${folderMap[reciter]}/${s}${a}.mp3`;
    }

    set({ audioUrl: url });
    },

    nextAyah: () => {
    const { currentAyah, currentSurah, surahInfo } = get();
    if (surahInfo && currentAyah < surahInfo.numberOfAyahs) {
    set({ currentAyah: currentAyah + 1 });
    } else if (currentSurah < 114) {
    set({ currentSurah: currentSurah + 1, currentAyah: 1 });
    } else {
    set({ isPlaying: false });
    }
    }
}));

export default useQuranStore;
