import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Info, CheckCircle, Bell, Save, PauseCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import useTimerStore from './timerStore';
import './Timer.css';

const Timer = () => {
    const { t } = useLanguage();
    const {
    mode,
    time,
    isRunning,
    countdownInput,
    setMode,
    setIsRunning,
    setCountdownInput,
    reset,
    startCountdown
    } = useTimerStore();

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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Request notification permission
    useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
    }
    }, []);

    return (
    <div className="timer-container fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('timer')}</h1>
    <p className="text-secondary">{t('timerDescription')}</p>
    </header>

    {/* Mode Selector */}
    <div className="mode-selector">
    <button
    className={`mode-btn ${mode === 'stopwatch' ? 'active' : ''}`}
    onClick={() => switchMode('stopwatch')}
    >
    ?? {t('stopwatchMode')}
    </button>
    <button
    className={`mode-btn ${mode === 'countdown' ? 'active' : ''}`}
    onClick={() => switchMode('countdown')}
    >
    ?? {t('countdownMode')}
    </button>
    </div>

    {/* Timer Display */}
    <div className="timer-display-container card">
    <div className="timer-display">{formatTime(time)}</div>

    <div className="timer-status">
    {isRunning && <span className="status-badge running">? {t('runningInBackground')}</span>}
    {!isRunning && time > 0 && <span className="status-badge paused">?? {t('pausedTemporarily')}</span>}
    </div>

    <div className="timer-controls">
    <button
    className="control-btn primary"
    onClick={toggleTimer}
    disabled={mode === 'countdown' && time === 0 && !isRunning}
    >
    {isRunning ? <Pause size={32} /> : <Play size={32} />}
    </button>
    <button className="control-btn secondary" onClick={handleReset}>
    <RotateCcw size={28} />
    </button>
    </div>
    </div>

    {/* Countdown Input */}
    {mode === 'countdown' && !isRunning && time === 0 && (
    <div className="countdown-input card">
    <h3 className="text-lg font-semibold mb-md">{t('setTime')}</h3>
    <div className="time-inputs">
    <div className="time-input-group">
    <label>{t('minutes')}</label>
    <input
    type="number"
    className="input time-input"
    min="0"
    max="999"
    value={countdownInput.minutes}
    onChange={(e) => setCountdownInput({ ...countdownInput, minutes: e.target.value })}
    placeholder="0"
    />
    </div>
    <div className="time-separator">:</div>
    <div className="time-input-group">
    <label>{t('seconds')}</label>
    <input
    type="number"
    className="input time-input"
    min="0"
    max="59"
    value={countdownInput.seconds}
    onChange={(e) => setCountdownInput({ ...countdownInput, seconds: e.target.value })}
    placeholder="0"
    />
    </div>
    </div>
    <button className="btn btn-primary mt-md" onClick={startCountdown}>
    {t('startCountdown')}
    </button>
    </div>
    )}

    {/* Info Section */}
    <div className="timer-info">
    <h3><Info className="info-icon" size={24} /> {t('info')}</h3>
    <ul className="info-list">
    <li>
    <CheckCircle className="info-icon" size={20} />
    <div>{t('timerHint1')}</div>
    </li>
    <li>
    <Bell className="info-icon" size={20} />
    <div>{t('timerHint2')}</div>
    </li>
    <li>
    <Save className="info-icon" size={20} />
    <div>{t('timerAutoSave')}</div>
    </li>
    <li>
    <PauseCircle className="info-icon" size={20} />
    <div>{t('timerPauseResume')}</div>
    </li>
    </ul>
    </div>
    </div>
    );
};

export default Timer;
