import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import useQuranStore from './quranStore';
import { surahsData } from './surahsData';
import axios from 'axios';
import {
  Search, Play, Pause, SkipForward, SkipBack, Volume2, Type, 
  RotateCcw, Info, BookOpen, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const recitersList = [
  { id: 'ar.alafasy', nameAr: 'مشاري العفاسي', nameEn: 'Mishary Alafasy' },
  { id: 'ar.husary', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Al-Husary' },
  { id: 'ar.husarymuallim', nameAr: 'الحصري (المعلم)', nameEn: 'Al-Husary (Teacher)' },
  { id: 'ar.minshawi', nameAr: 'محمد صديق المنشاوي', nameEn: 'Muhammad Al-Minshawi' },
  { id: 'ar.minshawimuallim', nameAr: 'المنشاوي (المعلم)', nameEn: 'Al-Minshawi (Teacher)' },
  { id: 'ar.abdulbasitmurattal', nameAr: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit Murattal' },
  { id: 'ar.abdulbasitmujawwad', nameAr: 'عبد الباسط (مجود)', nameEn: 'Abdul Basit Mujawwad' },
  { id: 'ar.abdurrahmaansudais', nameAr: 'عبد الرحمن السديس', nameEn: 'Abdul Rahman Al-Sudais' },
  { id: 'ar.mahermuaiqly', nameAr: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly' },
  { id: 'ar.yasser_aldosari', nameAr: 'ياسر الدوسري', nameEn: 'Yasser Al-Dosari' },
  { id: 'ar.nasser_alqatami', nameAr: 'ناصر القطامي', nameEn: 'Nasser Al-Qatami' },
  { id: 'ar.shaatree', nameAr: 'أبو بكر الشاطري', nameEn: 'Abu Bakr Al-Shatri' },
  { id: 'ar.ahmedajamy', nameAr: 'أحمد العجمي', nameEn: 'Ahmed Al-Ajamy' },
  { id: 'ar.hanirifai', nameAr: 'هاني الرفاعي', nameEn: 'Hani Al-Rifai' },
  { id: 'ar.saoodshuraym', nameAr: 'سعود الشريم', nameEn: 'Saud Al-Shuraim' },
];

export default function QuranTeacher() {
  const { language } = useLanguage();
  const {
    isPlaying,
    currentSurah,
    currentAyah,
    reciter,
    audioUrl,
    playMode,
    surahInfo,
    setPlaying,
    setSurah,
    setAyah,
    setReciter,
    setPlayMode
  } = useQuranStore();

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [surahData, setSurahData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(24);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // References
  const activeAyahRef = useRef(null);

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    return surahsData.filter(s =>
      s.name.includes(searchQuery) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery.trim()
    );
  }, [searchQuery]);

  // Load selected Surah details
  const loadSurahDetails = async (surahNum) => {
    setIsLoading(true);
    setError(null);

    const cacheKey = `quran-surah-${surahNum}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSurahData(parsed);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse cached surah', e);
      }
    }

    try {
      const res = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih`);
      if (res.data && res.data.code === 200 && res.data.data.length >= 2) {
        const editions = res.data.data;
        const arabicAyahs = editions[0].ayahs;
        const englishAyahs = editions[1].ayahs;

        const zipped = arabicAyahs.map((ayah, idx) => ({
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: englishAyahs[idx] ? englishAyahs[idx].text : '',
        }));

        const parsed = {
          number: editions[0].number,
          name: editions[0].name,
          englishName: editions[0].englishName,
          englishNameTranslation: editions[0].englishNameTranslation,
          numberOfAyahs: editions[0].numberOfAyahs,
          revelationType: editions[0].revelationType,
          ayahs: zipped
        };

        localStorage.setItem(cacheKey, JSON.stringify(parsed));
        setSurahData(parsed);
      } else {
        throw new Error('Invalid API structure');
      }
    } catch (err) {
      console.error('Error loading Surah from API', err);
      setError(
        language === 'ar'
          ? 'فشل تحميل السورة. يرجى التحقق من اتصال الإنترنت.'
          : 'Failed to load Surah. Please check your internet connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load surah when currentSurah changes
  useEffect(() => {
    loadSurahDetails(currentSurah);
  }, [currentSurah]);

  // Scroll active ayah into view
  useEffect(() => {
    if (activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentAyah, surahData]);

  // Toggle Play/Pause for specific ayah
  const handleAyahPlayToggle = (ayahIndex) => {
    if (currentAyah === ayahIndex && isPlaying) {
      setPlaying(false);
    } else {
      setAyah(ayahIndex);
      setPlaying(true);
    }
  };

  // Skip Forward / Backward
  const handleNextAyah = () => {
    if (surahData && currentAyah < surahData.numberOfAyahs) {
      setAyah(currentAyah + 1);
    } else if (currentSurah < 114) {
      setSurah(currentSurah + 1);
    }
  };

  const handlePrevAyah = () => {
    if (currentAyah > 1) {
      setAyah(currentAyah - 1);
    } else if (currentSurah > 1) {
      setSurah(currentSurah - 1);
    }
  };

  // Helper to strip Basmalah from the first ayah text
  const getCleanAyahText = (ayahText, surahNum, ayahNumInSurah) => {
    if (ayahNumInSurah !== 1 || surahNum === 1 || surahNum === 9) return ayahText;
    const basmalahClean = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    const basmalahUthmani = 'بِسۡمِ ٱللَّهِ ٱلرۡحۡمَٰنِ ٱلرَّحِيمِ';
    if (ayahText.startsWith(basmalahClean)) {
      return ayahText.slice(basmalahClean.length).trim();
    } else if (ayahText.startsWith(basmalahUthmani)) {
      return ayahText.slice(basmalahUthmani.length).trim();
    }
    return ayahText;
  };

  const activeReciter = recitersList.find(r => r.id === reciter) || recitersList[0];

  return (
    <div className="flex h-[calc(100vh-130px)] md:h-[calc(100vh-150px)] w-full overflow-hidden relative font-arabic rounded-2xl border border-border shadow-sm" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
      
      {/* 1. Surah Sidebar */}
      <div 
        className={`w-full md:w-80 shrink-0 border-l border-border h-full flex flex-col transition-all duration-300 ${
          showMobileSidebar ? 'absolute inset-0 z-40 bg-secondary' : 'hidden md:flex'
        }`}
        style={{ borderLeft: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
      >
        <div className="p-4 border-b border-border flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ar' ? 'فهرس السور' : 'Surah List'}
          </h2>
          {showMobileSidebar && (
            <button className="p-1 rounded hover:bg-tertiary md:hidden" onClick={() => setShowMobileSidebar(false)}>
              <X size={20} style={{ color: 'var(--text-primary)' }} />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="p-3">
          <div className="relative flex items-center">
            <Search className="absolute right-3 text-secondary" size={18} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="w-full pr-10 pl-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1"
              style={{
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-color)'
              }}
              placeholder={language === 'ar' ? 'بحث باسم السورة أو رقمها...' : 'Search by name or number...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Index List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredSurahs.map((s) => (
            <button
              key={s.number}
              onClick={() => {
                setSurah(s.number);
                setShowMobileSidebar(false);
              }}
              className={`w-full flex items-center justify-between p-3 my-1 rounded-xl text-right transition-all hover:bg-tertiary ${
                currentSurah === s.number ? 'bg-blue-50 dark:bg-blue-950/20 border-r-4 border-blue-500' : ''
              }`}
              style={{
                background: currentSurah === s.number ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-secondary bg-tertiary px-2 py-1 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {s.number}
                </span>
                <div className="text-left">
                  <div className="font-bold text-sm">{s.englishName}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{s.englishNameTranslation}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-quran text-base">{s.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ar' 
                    ? `${s.numberOfAyahs} آية • ${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`
                    : `${s.numberOfAyahs} Ayahs • ${s.revelationType}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Reader Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        
        {/* Top bar controls */}
        <div className="flex items-center justify-between p-4 border-b border-border" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg hover:bg-tertiary md:hidden" 
              onClick={() => setShowMobileSidebar(true)}
              title="Open index"
            >
              <BookOpen size={20} style={{ color: 'var(--text-primary)' }} />
            </button>
            {surahData && (
              <div>
                <h1 className="text-lg md:text-xl font-bold font-quran" style={{ color: 'var(--text-primary)' }}>
                  {surahData.name} ({surahData.englishName})
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ar'
                    ? `${surahData.numberOfAyahs} آية • ترتيبها ${surahData.number} • ${surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`
                    : `${surahData.numberOfAyahs} Ayahs • Surah ${surahData.number} • ${surahData.revelationType}`}
                </p>
              </div>
            )}
          </div>

          {/* Font Size & Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Type size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="range"
                min="20"
                max="40"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-20 md:w-28 accent-indigo-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
              <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-secondary)' }}>{fontSize}px</span>
            </div>
          </div>
        </div>

        {/* Reader Verses Scrollable */}
        <div className="flex-1 overflow-y-auto py-6 pb-28">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-4 md:px-8">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'جاري تحميل السورة الكريمة...' : 'Loading Holy Surah...'}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4 md:px-8">
              <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full">
                <Info size={36} />
              </div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{error}</p>
              <button 
                onClick={() => loadSurahDetails(currentSurah)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-bold"
              >
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : surahData ? (
            <div className="flex flex-col items-center w-full px-4 md:px-8">
              <div className="max-w-3xl md:max-w-4xl w-full flex flex-col gap-6">
              
              {/* Centered calligraphic Basmalah */}
              {currentSurah !== 1 && currentSurah !== 9 && (
                <div className="text-center py-6 font-quran text-3xl select-none" style={{ color: 'var(--text-primary)' }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              )}

              {/* Verses map */}
              {surahData.ayahs.map((ayah) => {
                const isVerseActive = currentAyah === ayah.numberInSurah;
                return (
                  <div
                    key={ayah.number}
                    ref={isVerseActive ? activeAyahRef : null}
                    className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 flex flex-col gap-4 ${
                      isVerseActive 
                        ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-md scale-[1.01]' 
                        : 'bg-card border-border hover:border-gray-300 dark:hover:border-gray-800'
                    }`}
                    style={{
                      borderColor: isVerseActive ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)',
                      background: isVerseActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)'
                    }}
                  >
                    {/* Verse actions / Play button */}
                    <div className="flex items-center justify-between border-b border-dashed pb-2 border-border" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="flex items-center gap-2">
                        <button
                          onClick={() => handleAyahPlayToggle(ayah.numberInSurah)}
                          className={`p-2 rounded-full hover:bg-tertiary transition-all ${
                            isVerseActive && isPlaying ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'text-indigo-500'
                          }`}
                          style={{
                            background: isVerseActive && isPlaying ? 'var(--accent-primary)' : 'transparent',
                            color: isVerseActive && isPlaying ? 'white' : 'var(--accent-primary)'
                          }}
                        >
                          {isVerseActive && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      </span>
                      <span className="text-xs font-mono font-bold text-secondary bg-tertiary px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {language === 'ar' ? `الآية ${ayah.numberInSurah}` : `Ayah ${ayah.numberInSurah}`}
                      </span>
                    </div>

                    {/* Arabic Text */}
                    <div 
                      className="text-center leading-loose font-quran font-medium w-full"
                      style={{ 
                        fontSize: `${fontSize}px`, 
                        color: 'var(--text-primary)',
                        lineHeight: '2.5',
                        fontFamily: 'var(--font-quran)',
                        textAlign: 'center'
                      }}
                    >
                      {getCleanAyahText(ayah.text, currentSurah, ayah.numberInSurah)}
                    </div>

                    {/* English translation */}
                    <div className="text-center text-sm font-sans border-t border-dashed pt-2 border-border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {ayah.translation}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom player controls bar */}
        <div 
          className="absolute bottom-0 inset-x-0 border-t border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10"
          style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          {/* Active audio metadata */}
          <div className="flex items-center gap-3">
            <Volume2 className="text-indigo-500" size={20} />
            <div className="text-right md:text-left">
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {language === 'ar' ? 'تلاوة صوتية نشطة' : 'Audio Recitation'}
              </div>
              <div className="text-xs text-secondary" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ar'
                  ? `القارئ: ${activeReciter.nameAr} • الآية ${currentAyah}`
                  : `Reciter: ${activeReciter.nameEn} • Ayah ${currentAyah}`}
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-tertiary text-primary" onClick={handlePrevAyah}>
              <SkipBack size={18} style={{ color: 'var(--text-primary)' }} />
            </button>
            <button 
              className="p-3.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition-transform active:scale-95" 
              style={{ background: 'var(--accent-primary)' }}
              onClick={() => setPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="p-2 rounded-full hover:bg-tertiary text-primary" onClick={handleNextAyah}>
              <SkipForward size={18} style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>

          {/* Reciter selector & Playback Mode */}
          <div className="flex items-center gap-2.5">
            {/* Play Mode */}
            <button
              onClick={() => setPlayMode(playMode === 'continuous' ? 'single' : 'continuous')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                playMode === 'continuous' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border-indigo-200' : 'text-secondary border-border'
              }`}
              style={{
                borderColor: playMode === 'continuous' ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)',
                background: playMode === 'continuous' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: playMode === 'continuous' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
              title={language === 'ar' ? 'وضعية التشغيل المستمر' : 'Continuous Mode'}
            >
              {playMode === 'continuous' 
                ? (language === 'ar' ? 'تلاوة متصلة' : 'Continuous') 
                : (language === 'ar' ? 'آية واحدة' : 'Single Ayah')}
            </button>

            {/* Reciter Dropdown */}
            <select
              value={reciter}
              onChange={(e) => setReciter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 cursor-pointer"
              style={{
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-color)'
              }}
            >
              {recitersList.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === 'ar' ? r.nameAr : r.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
