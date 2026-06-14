import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { playGlobalAlert, stopAllGlobalAlerts } from '../utils/soundUtils';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    // Media State
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingVerse, setPlayingVerse] = useState(null); // 'playing' (surah) or verseKey
    const audioRef = useRef(null);

    // Quran State (Persistent)
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);

    // Cleanup on unmount (though this provider is usually at App level)
    useEffect(() => {
    return () => {
    if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
    }
    };
    }, []);

    const playVerse = (url, verseKey) => {
    if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setPlayingVerse(verseKey);
    audio.onended = () => setPlayingVerse(null);
    audio.onerror = (e) => {
    console.error('Audio playback error', e);
    setPlayingVerse(null);
    };

    audio.play().catch(e => console.error("Play failed", e));
    setCurrentAudio(audio);
    };

    const playSurah = (url) => {
    if (audioRef.current) {
    // If already playing this surah, toggle? Or just strict play new?
    // For now, strict play new url.
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setPlayingVerse('playing');
    audio.onended = () => setPlayingVerse(null);
    audio.onerror = (e) => {
    console.error('Audio playback error', e);
    setPlayingVerse(null);
    };

    audio.play().catch(e => console.error("Play failed", e));
    setCurrentAudio(audio);
    };

    const playNotification = (type = 'work') => {
    playGlobalAlert(1.0, type);
    };

    const stopAudio = () => {
    if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlayingVerse(null);
    }
    // إيقاف جميع الأصوات النشطة الأخرى
    stopAllGlobalAlerts();
    };

    const isPlaying = (key) => {
    if (!key) return !!playingVerse; // is anything playing?
    return playingVerse === key;
    };

    const value = {
    playVerse,
    playSurah,
    playNotification,
    stopAudio,
    playingVerse,
    isPlaying,
    selectedReciter,
    setSelectedReciter,
    selectedSurah,
    setSelectedSurah
    };

    return (
    <AudioContext.Provider value={value}>
    {children}
    </AudioContext.Provider>
    );
};
