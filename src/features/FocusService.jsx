import React, { useEffect, useRef } from 'react';
import useFocusStore from './focusStore';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';

const FocusService = () => {
    const { isRunning, tick, mode } = useFocusStore();
    const { playNotification } = useAudio();
    const { t } = useLanguage();
    const intervalRef = useRef(null);

    useEffect(() => {
    if (isRunning) {
    intervalRef.current = setInterval(() => {
    const result = tick();
    if (result) {
    handleFocusComplete(result);
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

    const handleFocusComplete = async (result) => {
    const { completedMode } = result;

    // Play sound
    playNotification(completedMode === 'work' ? 'work' : 'break');

    // Show notification
    const notificationTitle = t('pomodoroNotificationTitle');
    const notificationBody = completedMode === 'work' ? t('breakTime') : t('workTime2');

    if (window.electron) {
    await window.electron.showNotification({
    title: notificationTitle,
    body: notificationBody,
    silent: false,
    });
    } else {
    if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notificationTitle, {
    body: notificationBody,
    icon: 'icon.png'
    });
    }
    }
    };

    return null;
};

export default FocusService;
