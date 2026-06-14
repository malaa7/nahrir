import React, { useEffect, useRef } from 'react';
import useQuranStore from './quranStore';
import axios from 'axios';

const QuranService = () => {
    const {
    isPlaying,
    currentSurah,
    currentAyah,
    audioUrl,
    playMode,
    reciter,
    nextAyah,
    setPlaying,
    fetchAudio,
    setSurahInfo,
    surahInfo
    } = useQuranStore();

    const audioRef = useRef(null);
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }

    // Fetch Surah Info when surah changes to know ayah count
    useEffect(() => {
    axios.get(`https://api.alquran.cloud/v1/surah/${currentSurah}`)
    .then(res => setSurahInfo(res.data.data))
    .catch(e => console.error("Error fetching surah info in service", e));
    }, [currentSurah]);

    // Update audio source when audioUrl changes
    useEffect(() => {
    if (audioUrl && audioRef.current) {
    audioRef.current.src = audioUrl;
    if (isPlaying) {
    audioRef.current.play().catch(e => console.error("Bg Play Error", e));
    }
    }
    }, [audioUrl]);

    // Handle Play/Pause
    useEffect(() => {
    if (isPlaying) {
    if (audioRef.current && audioRef.current.src) {
    audioRef.current.play().catch(e => console.error("Bg Play Toggle Error", e));
    }
    } else {
    if (audioRef.current) audioRef.current.pause();
    }
    }, [isPlaying]);

    // End of Ayah Logic
    useEffect(() => {
    const handleEnded = () => {
    if (playMode === 'continuous') {
    setTimeout(() => {
    nextAyah();
    }, 500);
    } else {
    setPlaying(false);
    }
    };

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
    }, [playMode, nextAyah, setPlaying]);

    // Whenever Surah, Ayah or Reciter change, fetch new audio
    useEffect(() => {
    fetchAudio();
    }, [currentSurah, currentAyah, reciter]);

    return null; // Invisible service
};

export default QuranService;
