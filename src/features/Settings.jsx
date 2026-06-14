import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Download, Upload, AlertCircle, Bell, Volume2, Power } from 'lucide-react';
import usePrayerStore from './PrayerTimes/store';
import useMeroStore from './MeroCalendar/meroStore';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

const Settings = () => {
    const { t, language, changeLanguage } = useLanguage();
    const { theme, changeTheme } = useTheme();
    const [appVersion, setAppVersion] = useState('1.2.0');
    const [message, setMessage] = useState(null);
    const [startOnBoot, setStartOnBoot] = useState(false);

    const { settings: prayerSettings, setSettings: setPrayerSettings } = usePrayerStore();
    const { settings: meroSettings, updateSetting: updateMeroSetting } = useMeroStore();

    useEffect(() => {
    loadAppVersion();
    loadBootSettings();
    }, []);

    const loadBootSettings = async () => {
    if (window.electron && window.electron.getStartOnBoot) {
    const enabled = await window.electron.getStartOnBoot();
    setStartOnBoot(enabled);
    }
    };

    const handleStartOnBootToggle = async () => {
    if (window.electron && window.electron.setStartOnBoot) {
    const nextStat = !startOnBoot;
    const result = await window.electron.setStartOnBoot(nextStat);
    if (result.success) {
    setStartOnBoot(nextStat);
    showMessage(t('success'), 'success');
    } else {
    showMessage(t('error'), 'error');
    }
    }
    };

    const loadAppVersion = async () => {
    if (window.electron) {
    const version = await window.electron.getAppVersion();
    setAppVersion(version);
    }
    };

    const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
    };

    const handleBackup = async () => {
    if (window.electron) {
    const result = await window.electron.backupData();
    if (result.success) {
    showMessage(`${t('success')}! ${t('backupSaved')}`, 'success');
    } else if (result.error !== 'Cancelled') {
    showMessage(`${t('error')}: ${result.error}`, 'error');
    }
    } else {
    try {
    const backupData = {};
    for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    backupData[key] = localStorage.getItem(key);
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nahrir_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showMessage(`${t('success')}! ${t('backupSaved')}`, 'success');
    } catch (error) {
    console.error('Failed to create backup:', error);
    showMessage(`${t('error')}`, 'error');
    }
    }
    };

    const handleRestore = async () => {
    if (window.electron) {
    if (confirm(t('confirmRestore'))) {
    const result = await window.electron.restoreData();
    if (result.success) {
    showMessage(`${t('success')}! ${t('dataRestored')}`, 'success');
    setTimeout(() => window.location.reload(), 2000);
    } else if (result.error !== 'Cancelled') {
    showMessage(`${t('error')}: ${result.error}`, 'error');
    }
    }
    } else {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (confirm(t('confirmRestore'))) {
        localStorage.clear();
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key]);
        });
        showMessage(`${t('success')}! ${t('dataRestored')}`, 'success');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      showMessage(language === 'ar' ? 'ملف نسخة احتياطية غير صالح' : 'Invalid backup file', 'error');
    }
    };
    reader.readAsText(file);
    };
    fileInput.click();
    }
    };

    return (
    <div className="settings-container fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('settings')}</h1>
    <p className="text-secondary">{t('settingsDescription')}</p>
    </header>

    {/* Toast Message */}
    {message && (
    <div className={`toast-message toast-${message.type}`}>
    {message.text}
    </div>
    )}

    <div className="settings-sections">
    {/* Appearance */}
    <div className="settings-section card">
    <h2 className="section-title">{t('appearance')}</h2>

    <div className="setting-item">
    <div className="setting-label">
    <Globe size={20} />
    <span>{t('language')}</span>
    </div>
    <select
    className="input setting-select"
    value={language}
    onChange={(e) => changeLanguage(e.target.value)}
    >
    <option value="ar">{t('arabic')}</option>
    <option value="en">English</option>
    </select>
    </div>

    <div className="setting-item">
    <div className="setting-label">
    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
    <span>{t('theme')}</span>
    </div>
    <div className="theme-buttons">
    <button
    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
    onClick={() => changeTheme('light')}
    >
    <Sun size={20} />
    {t('light')}
    </button>
    <button
    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
    onClick={() => changeTheme('dark')}
    >
    <Moon size={20} />
    {t('dark')}
    </button>
    </div>
    </div>
    </div>

    {/* Data & Backup */}
    <div className="settings-section card">
    <h2 className="section-title">{t('dataBackup')}</h2>

    {!window.electron && (
    <div className="info-banner">
    <AlertCircle size={20} />
    <span>{t('backupWebVersion')}</span>
    </div>
    )}

    <div className="backup-buttons">
    <button className="btn btn-primary" onClick={handleBackup} title={t('backup')}>
    <Download size={20} />
    {t('backup')}
    </button>
    <button className="btn btn-secondary" onClick={handleRestore} title={t('restore')}>
    <Upload size={20} />
    {t('restore')}
    </button>
    </div>

    <p className="text-sm text-secondary" style={{ marginTop: 'var(--spacing-md)' }}>
    {t('backupReminder')}
    </p>
    </div>

    {/* Notifications & System */}
    <div className="settings-section card">
    <h2 className="section-title">{t('general')}</h2>

    <div className="setting-item">
    <div className="setting-label">
    <Power size={20} />
    <span>{t('startOnBoot')}</span>
    </div>
    <label className="toggle-switch">
    <input
    type="checkbox"
    checked={startOnBoot}
    onChange={handleStartOnBootToggle}
    disabled={!window.electron}
    />
    <span className="toggle-slider"></span>
    </label>
    </div>

    <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
    <div className="setting-label" style={{ width: '100%', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
    <Volume2 size={20} />
    <span>{language === 'ar' ? 'مستوى صوت الأذان' : 'Azan Volume'}</span>
    </div>
    <span className="text-sm font-bold">{Math.round(prayerSettings.volume * 100)}%</span>
    </div>
    <input
    type="range"
    min="0"
    max="1"
    step="0.05"
    className="input-range"
    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
    value={prayerSettings.volume}
    onChange={(e) => setPrayerSettings({ volume: parseFloat(e.target.value) })}
    />
    </div>

    <div style={{ height: '1px', background: 'var(--border-color)', margin: 'var(--spacing-md) 0', opacity: 0.5 }}></div>

    {/* Mero Reminder Settings */}
    <div className="setting-item">
    <div className="setting-label">
    <Bell size={20} />
    <span>{language === 'ar' ? 'صوت تذكيرات التقويم' : 'Calendar Reminder Sound'}</span>
    </div>
    <label className="toggle-switch">
    <input
    type="checkbox"
    checked={meroSettings.soundEnabled}
    onChange={(e) => updateMeroSetting('soundEnabled', e.target.checked)}
    />
    <span className="toggle-slider"></span>
    </label>
    </div>

    <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
    <div className="setting-label" style={{ width: '100%', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
    <Volume2 size={20} />
    <span>{language === 'ar' ? 'مستوى صوت التذكير' : 'Reminder Volume'}</span>
    </div>
    <span className="text-sm font-bold">{Math.round(meroSettings.alertVolume)}%</span>
    </div>
    <input
    type="range"
    min="0"
    max="100"
    step="5"
    className="input-range"
    style={{ width: '100%', accentColor: 'var(--accent-secondary)' }}
    value={meroSettings.alertVolume}
    onChange={(e) => updateMeroSetting('alertVolume', parseInt(e.target.value))}
    />
    </div>
    </div>

    {/* About */}
    <div className="settings-section card">
    <h2 className="section-title">{t('about')}</h2>

    <div className="about-info">
    <h3 className="about-title">{t('appName')}</h3>

    <p className="text-secondary" style={{ marginTop: 'var(--spacing-md)', lineHeight: '1.8' }}>
    {t('aboutText1')}
    </p>

    <p className="text-secondary" style={{ marginTop: 'var(--spacing-md)', lineHeight: '1.8' }}>
    {t('aboutText2')}
    </p>

    <p className="text-secondary" style={{ marginTop: 'var(--spacing-md)', lineHeight: '1.8' }}>
    {t('aboutText3')}
    </p>

    <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
    <p className="text-sm text-secondary">
    {t('version')}: {appVersion}
    </p>
    <p className="text-sm text-secondary">
    {t('releaseDate')}
    </p>

    <div style={{ marginTop: 'var(--spacing-sm)' }}>
    <p className="text-sm" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
    👨‍💻 {t('developer')}: (أبو عمر) محمد علاء
    </p>
    </div>

    <p
    className="text-sm"
    style={{ color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
    onClick={() => {
    const url = 'https://nahrir.pages.dev/';
    window.electron ? window.electron.openExternal(url) : window.open(url, '_blank');
    }}
    >
    🌐 {language === 'ar' ? 'موقع البرنامج' : 'Program Website'}
    </p>

    <p
    className="text-sm"
    style={{ color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
    onClick={() => {
    const url = 'https://www.facebook.com/muhammadalaa168/';
    window.electron ? window.electron.openExternal(url) : window.open(url, '_blank');
    }}
    >
    📘 {t('facebook')}: محمد علاء (أبو عمر)
    </p>

    <p
    className="text-sm"
    style={{ color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
    onClick={() => {
    const url = 'https://www.youtube.com/@nahrir1';
    window.electron ? window.electron.openExternal(url) : window.open(url, '_blank');
    }}
    >
    🎬 {t('youtube')}: @nahrir1
    </p>
    </div>

    <p className="text-sm text-secondary" style={{ marginTop: 'var(--spacing-lg)' }}>
    {t('copyright')}
    </p>
    </div>
    </div>
    </div>
    </div>
    );
};

export default Settings;
