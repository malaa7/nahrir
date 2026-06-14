import React, { useEffect, useRef } from 'react';
import useTimerStore from './timerStore';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';

const TimerService = () => {
    const { isRunning, tick, mode } = useTimerStore();
    const { playNotification } = useAudio();
    const { t } = useLanguage();
    const intervalRef = useRef(null);

    useEffect(() => {
    if (isRunning) {
    intervalRef.current = setInterval(() => {
    const finished = tick();
    if (finished) {
    handleTimerComplete();
    }
    }, 1000);
    } else {
    if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    }
    }

    return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    };
    }, [isRunning, tick]);

    const handleTimerComplete = async () => {
    // Play sound
    playNotification();

    // Show notification
    if (window.electron) {
    await window.electron.showNotification({
    title: t('timerNotificationTitle'),
    body: mode === 'stopwatch' ? t('stopwatchStopped') : t('countdownFinished'),
    silent: false,
    });
    } else {
    if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(t('timerNotificationTitle'), {
    body: mode === 'stopwatch' ? t('stopwatchStopped') : t('countdownFinished'),
    icon: 'icon.png'
    });
    }
    }
    };

    return null;
};

export default TimerService;
