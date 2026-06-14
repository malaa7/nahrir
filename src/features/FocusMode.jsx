import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import useFocusStore from './focusStore';
import './FocusMode.css';

const FocusMode = () => {
    const { t } = useLanguage();
    const {
    mode,
    timeLeft,
    isRunning,
    sessions,
    settings,
    setMode,
    setIsRunning,
    reset,
    } = useFocusStore();

    // Function to open Noisli
    const openNoisli = async () => {
    if (window.electron) {
    await window.electron.openExternal('https://www.noisli.com');
    } else {
    window.open('https://www.noisli.com', '_blank');
    }
    };

    const toggleTimer = () => {
    setIsRunning(!isRunning);
    };

    const handleReset = () => {
    reset();
    };

    const switchMode = (newMode) => {
    setMode(newMode);
    };

    const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = () => {
    let total;
    if (mode === 'work') total = settings.workDuration * 60;
    else if (mode === 'break') total = settings.breakDuration * 60;
    else total = settings.longBreakDuration * 60;

    return ((total - timeLeft) / total) * 100;
    };

    // Request notification permission
    useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
    }
    }, []);

    return (
    <div className="focus-container fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('focusMode')}</h1>
    <p className="text-secondary">{t('pomodoroDescription')}</p>
    </header>

    {/* Mode Selector */}
    <div className="mode-selector">
    <button
    className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
    onClick={() => switchMode('work')}
    >
    {t('work')}
    </button>
    <button
    className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
    onClick={() => switchMode('break')}
    >
    {t('shortBreak2')}
    </button>
    <button
    className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
    onClick={() => switchMode('longBreak')}
    >
    {t('longBreak2')}
    </button>
    </div>

    {/* Timer Display */}
    <div className={`timer-card ${mode}`}>
    <div className="timer-progress" style={{ '--progress': `${progress()}%` }}></div>

    <div className="timer-display">{formatTime(timeLeft)}</div>

    <div className="timer-label">
    {mode === 'work' ? `? ${t('workTime')}` : mode === 'break' ? `? ${t('shortBreak')}` : `?? ${t('longBreak')}`}
    </div>

    {isRunning && (
    <div className="timer-status">
    <span className="status-badge">? {t('runningInBackground')}</span>
    </div>
    )}

    <div className="timer-controls">
    <button className="control-btn" onClick={toggleTimer}>
    {isRunning ? <Pause size={32} /> : <Play size={32} />}
    </button>
    <button className="control-btn secondary" onClick={handleReset}>
    <RotateCcw size={28} />
    </button>
    </div>
    </div>

    {/* Sessions Count */}
    <div className="sessions-info card">
    <div className="sessions-count">
    <span className="sessions-number">{sessions}</span>
    <span className="sessions-label">{t('completedSessions')}</span>
    </div>
    <div className="sessions-progress">
    {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
    <div
    key={i}
    className={`session-dot ${i < (sessions % settings.sessionsBeforeLongBreak) ? 'completed' : ''}`}
    />
    ))}
    </div>
    </div>

    {/* Tips */}
    <div className="tips-section card">
    <h3 className="text-lg font-semibold mb-md">{t('natureSounds')}</h3>
    <p className="text-secondary mb-md" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
    {t('natureSoundsDescription')}
    </p>
    <button className="btn btn-primary" onClick={openNoisli} style={{ width: '100%' }}>
    {t('openNoisli')}
    </button>
    </div>

    <div className="tips-section card">
    <h3 className="text-lg font-semibold mb-md">?? {t('timerInfo')}</h3>
    <ul className="tips-list">
    <li>? {t('focusHint1')}</li>
    <li>?? {t('focusHint2')}</li>
    <li>?? {t('stateAutoSaved')}</li>
    <li>?? {t('focusOnOne')}</li>
    </ul>
    </div>
    </div>
    );
};

export default FocusMode;
