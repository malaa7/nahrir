import React, { useEffect, useState } from 'react';
import { MapPin, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { prayerApi } from '../../services/prayerApi';
import usePrayerStore from './store';
import './PrayerTimes.css';

const PrayerTimes = () => {
    const { t, language } = useLanguage();

    const {
    settings,
    setSettings,
    timings,
    setTimings,
    loading,
    setLoading,
    nextPrayer,
    toggleAzan,
    toggleNotifications,
    activeAzan,
    stopAzan
    } = usePrayerStore();

    const [testAudio, setTestAudio] = useState(null);

    // Initial fetch handled by Service, but manual refresh logic remains here
    const handleRefresh = async () => {
    setLoading(true);
    const result = await prayerApi.getPrayerTimes(settings.city, settings.country, settings.method);
    if (result.success) {
    setTimings(result.timings);
    } else {
    alert(`${t('error')}: ${result.error}`);
    }
    setLoading(false);
    };

    const handleLocationChange = (city, country) => {
    // This updates store, which triggers Service to fetch new data
    setSettings({ city, country });
    };

    const formatTimeRemaining = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
    return `${hours} ${t('hours')} ${t('and')} ${mins} ${t('minutes')}`;
    }
    return `${mins} ${t('minutes')}`;
    };

    const prayerNames = {
    Fajr: t('fajr'),
    Sunrise: t('sunrise'),
    Dhuhr: t('dhuhr'),
    Asr: t('asr'),
    Maghrib: t('maghrib'),
    Isha: t('isha'),
    Midnight: t('midnight'),
    };

    return (
    <div className="prayer-times-container fade-in">
    <header className="feature-header flex justify-between items-center">
    <div>
    <h1 className="text-2xl font-bold">{t('prayerTimes')}</h1>
    <p className="text-secondary">{t('prayerDescription')}</p>
    </div>
    <div className="flex gap-2">
    {/* Stop Real Adhan Button (Only if playing) */}
    {activeAzan && (
    <button
    className="btn btn-danger pulse"
    onClick={stopAzan}
    style={{ background: '#ff4757', color: 'white' }}
    >
    <VolumeX size={16} />
    {language === 'ar' ? 'إيقاف المؤذن' : 'Stop Adhan'}
    </button>
    )}

    <button
    className={`btn-icon ${settings.azanEnabled ? 'active' : ''}`}
    onClick={toggleAzan}
    title={t('toggleAzan')}
    >
    {settings.azanEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>

    <button
    className={`btn btn-secondary ${testAudio ? 'active' : ''}`}
    onClick={() => {
    if (testAudio) {
    testAudio.pause();
    setTestAudio(null);
    } else {
    const audio = new Audio('./sounds/General.mp3');
    audio.onended = () => setTestAudio(null);
    audio.play().catch(e => alert(t('error') + ": " + e.message));
    setTestAudio(audio);
    }
    }}
    >
    <Volume2 size={16} />
    {testAudio
    ? (language === 'ar' ? 'إيقاف التجربة' : 'Stop Test')
    : (language === 'ar' ? 'تجربة الأذان' : 'Test Azan')}
    </button>
    </div>
    </header>

    <div className="location-card card">
    <div className="location-row">
    <select
    className="input"
    value={settings.city}
    onChange={(e) => {
    const location = prayerApi.popularLocations.find(l => l.city === e.target.value);
    if (location) {
    handleLocationChange(location.city, location.country);
    }
    }}
    >
    {prayerApi.popularLocations.map((loc) => (
    <option key={loc.city} value={loc.city}>
    {language === 'ar' ? loc.nameAr : loc.city}
    </option>
    ))}
    </select>

    <button className="btn btn-primary" onClick={handleRefresh} disabled={loading}>
    <RefreshCw size={20} className={loading ? 'spin' : ''} />
    {loading ? t('loading') : t('refresh')}
    </button>
    </div>
    </div>

    {nextPrayer && (
    <div className="next-prayer-card card">
    <div className="next-prayer-label text-sm text-secondary">{t('nextPrayer')}</div>
    <div className="next-prayer-name">{prayerNames[nextPrayer.name] || nextPrayer.name}</div>
    <div className="next-prayer-time">{nextPrayer.time}</div>
    <div className="time-remaining">{formatTimeRemaining(nextPrayer.minutesRemaining)}</div>
    </div>
    )}

    {timings && (
    <div className="prayers-grid">
    <PrayerCard name={t('fajr')} time={timings.Fajr} icon="🌅" active={nextPrayer?.name === 'Fajr'} />
    <PrayerCard name={t('sunrise')} time={timings.Sunrise} icon="☀️" active={nextPrayer?.name === 'Sunrise'} />
    <PrayerCard name={t('dhuhr')} time={timings.Dhuhr} icon="🌞" active={nextPrayer?.name === 'Dhuhr'} />
    <PrayerCard name={t('asr')} time={timings.Asr} icon="🌤️" active={nextPrayer?.name === 'Asr'} />
    <PrayerCard name={t('maghrib')} time={timings.Maghrib} icon="🌇" active={nextPrayer?.name === 'Maghrib'} />
    <PrayerCard name={t('isha')} time={timings.Isha} icon="🌙" active={nextPrayer?.name === 'Isha'} />
    </div>
    )}
    </div>
    );
};

const PrayerCard = ({ name, time, icon, active }) => (
    <div className={`prayer-card card ${active ? 'active-prayer' : ''}`}>
    <div className="prayer-icon">{icon}</div>
    <div className="prayer-name">{name}</div>
    <div className="prayer-time">{time && time.split(' ')[0]}</div>
    </div>
);

export default PrayerTimes;
