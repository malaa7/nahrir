import React from 'react';
import useMeroStore from './meroStore';
import { useLanguage } from '../../contexts/LanguageContext';

function MeroAlarmOverlay() {
    const { language } = useLanguage();
    const { alarmActive, alarmData, dismissAlarm, settings } = useMeroStore();

    const t = {
    reminder: language === 'ar' ? '🔔 تذكير!' : '🔔 Reminder!',
    dismiss: language === 'ar' ? 'إيقاف المنبه' : 'Dismiss Alarm',
    soundPlaying: language === 'ar' ? 'الصوت قيد التشغيل...' : 'Sound playing...',
    soundMuted: language === 'ar' ? 'الصوت مكتوم' : 'Sound muted',
    };

    if (!alarmActive) return null;

    return (
    <div className="mero-alarm-overlay">
    <div className="mero-alarm-backdrop"></div>

    <div className="mero-alarm-card">
    {/* Alarm Icon */}
    <div className="mero-alarm-icon">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    </div>

    {/* Alarm Info */}
    <h2 className="mero-alarm-title">{t.reminder}</h2>

    {alarmData && (
    <>
    <h3 className="mero-alarm-event-title">{alarmData.title}</h3>
    <p className="mero-alarm-body">{alarmData.body}</p>
    </>
    )}

    {/* Dismiss Button */}
    <button onClick={dismissAlarm} className="mero-alarm-dismiss-btn">
    {t.dismiss}
    </button>

    {/* Sound indicator */}
    <div className="mero-alarm-sound-indicator">
    {settings.soundEnabled ? (
    <>
    <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
    </svg>
    <span>{t.soundPlaying}</span>
    </>
    ) : (
    <>
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
    <span>{t.soundMuted}</span>
    </>
    )}
    </div>
    </div>
    </div>
    );
}

export default MeroAlarmOverlay;
