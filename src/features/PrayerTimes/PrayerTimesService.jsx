import React, { useEffect, useRef } from 'react';
import usePrayerStore from './store';
import { prayerApi } from '../../services/prayerApi';
import { playGlobalAlert } from '../../utils/soundUtils';
import { useLanguage } from '../../contexts/LanguageContext';

const PrayerTimesService = () => {
    const {
    settings,
    timings,
    setTimings,
    setNextPrayer,
    setLoading,
    setActiveAzan,
    stopAzan
    } = usePrayerStore();

    const { t } = useLanguage();
    const lastCheckedMinute = useRef(null);

    // Function to play Azan specifically
    const playAzan = (prayerName, volume = 1.0) => {
    try {
    // First stop any current Azan
    stopAzan();

    const fileName = prayerName === 'Fajr' ? 'fajr.mp3' : 'General.mp3';
    const audio = new Audio(`./sounds/${fileName}`);
    audio.volume = volume;

    audio.onended = () => {
    setActiveAzan(null);
    };

    audio.play()
    .then(() => {
    setActiveAzan(audio);
    })
    .catch(e => {
    console.error("Error playing Azan:", e);
    setActiveAzan(null);
    });
    } catch (error) {
    console.error("Failed to initialize Azan audio:", error);
    }
    };

    // Fetch timings when settings change
    useEffect(() => {
    const fetchTimings = async () => {
    setLoading(true);
    const result = await prayerApi.getPrayerTimes(settings.city, settings.country, settings.method);
    if (result.success) {
    setTimings(result.timings);
    }
    setLoading(false);
    };

    fetchTimings();
    }, [settings.city, settings.country, settings.method, setTimings, setLoading]);

    const triggerPrayerAlert = (prayerName) => {
    const title = 'نَحْرِير';
    const body = (prayerName === 'Sunrise' || prayerName === 'Sunset' || prayerName === 'Midnight' || prayerName === 'Imsak')
    ? `${t('timeFor')} ${prayerName}`
    : `${t('timeFor')} ${t(prayerName.toLowerCase()) || prayerName}`;

    if (settings.notificationsEnabled) {
    if (window.electron) {
    window.electron.showNotification({
    title,
    body,
    silent: settings.azanEnabled ? true : false // Silent if Azan will play separately
    });
    } else {
    new Notification(title, {
    body,
    icon: 'icon.png',
    silent: settings.azanEnabled ? true : false
    });
    }

    if (prayerName === 'Sunrise' || prayerName === 'Sunset' || prayerName === 'Midnight' || prayerName === 'Imsak') {
    playGlobalAlert(1.0, 'tick');
    } else if (!settings.azanEnabled) {
    playGlobalAlert(1.0, 'break');
    }
    }

    if (settings.azanEnabled && !(prayerName === 'Sunrise' || prayerName === 'Sunset' || prayerName === 'Midnight' || prayerName === 'Imsak')) {
    playAzan(prayerName, settings.volume);
    }
    };

    // Check time every minute
    useEffect(() => {
    const checkTime = () => {
    if (!timings) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    // Check if we already processed this minute
    if (lastCheckedMinute.current === currentTimeStr) return;

    // Update next prayer info
    const next = prayerApi.getNextPrayer(timings);
    setNextPrayer(next);

    // Check for prayer time match
    Object.entries(timings).forEach(([prayerName, time]) => {
    const cleanTime = time.split(' ')[0];
    if (cleanTime === currentTimeStr) {
    triggerPrayerAlert(prayerName);
    }
    });

    lastCheckedMinute.current = currentTimeStr;
    };

    const timer = setInterval(checkTime, 10000);
    checkTime();

    return () => clearInterval(timer);
    }, [timings, settings.notificationsEnabled, settings.azanEnabled, t, setNextPrayer]);

    return null;
};

export default PrayerTimesService;
