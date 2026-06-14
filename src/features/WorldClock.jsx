import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { timeApi } from '../services/timeApi';
import { worldClockStorage } from '../utils/storage';
import useWorldClockStore from './worldClockStore';
import './WorldClock.css';

const WorldClock = () => {
    const { t, language } = useLanguage();
    const { cities, loadCities, addCity: storeAddCity, removeCity } = useWorldClockStore();
    const [times, setTimes] = useState({});
    const [selectedCity, setSelectedCity] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
    loadCities();
    }, []);

    useEffect(() => {
    if (cities.length > 0) {
    updateAllTimes();
    const interval = setInterval(updateAllTimes, 1000);
    return () => clearInterval(interval);
    }
    }, [cities]);

    const updateAllTimes = async () => {
    const newTimes = {};
    for (const timezone of cities) {
    try {
    const now = new Date();
    newTimes[timezone] = now.toLocaleString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    });
    } catch (e) {
    newTimes[timezone] = '--:--:--';
    }
    }
    setTimes(newTimes);
    };

    const handleAddCity = async () => {
    let cityToAdd = selectedCity;

    // If nothing is selected in dropdown but there is a search result, take the first one
    if (!cityToAdd && citySearch && filteredCities.length > 0) {
    cityToAdd = filteredCities[0].timezone;
    }

    if (cityToAdd) {
    const success = await storeAddCity(cityToAdd);
    if (success) {
    setSelectedCity('');
    setCitySearch('');
    // Visual feedback (optional)
    } else {
    alert(language === 'ar' ? 'هذه المدينة مضافة بالفعل' : 'This city is already added');
    }
    } else {
    alert(language === 'ar' ? 'يرجى اختيار مدينة أولاً' : 'Please select a city first');
    }
    };

    const getCityName = (timezone) => {
    const city = timeApi.popularCities.find((c) => c.timezone === timezone);
    return city ? (language === 'ar' ? city.name : city.nameEn) : timezone.split('/').pop();
    };

    const filteredCities = timeApi.popularCities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    city.nameEn.toLowerCase().includes(citySearch.toLowerCase())
    );

    return (
    <div className="world-clock fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('worldClock')}</h1>
    <p className="text-secondary">{t('worldClockDesc')}</p>
    </header>

    <div className="add-city-card card">
    <div className="add-city-row">
    <div className="search-group">
    <input
    type="text"
    className="input search-input"
    placeholder={language === 'ar' ? 'ابحث عن مدينة...' : 'Search for a city...'}
    value={citySearch}
    onChange={(e) => setCitySearch(e.target.value)}
    />
    <select
    className="input city-select"
    value={selectedCity}
    onChange={(e) => setSelectedCity(e.target.value)}
    >
    <option value="">{t('selectCity')}</option>
    {filteredCities.map((city, index) => (
    <option key={`${city.timezone}-${index}`} value={city.timezone}>
    {language === 'ar' ? city.name : city.nameEn}
    </option>
    ))}
    </select>
    <button className="btn btn-primary add-btn" onClick={handleAddCity}>
    <Plus size={20} />
    {t('addCity')}
    </button>
    </div>
    </div>
    </div>

    <div className="clocks-grid">
    {cities.length === 0 ? (
    <div className="empty-state card">
    <Clock size={48} className="text-secondary" />
    <p className="text-secondary">{t('selectCity')}</p>
    </div>
    ) : (
    cities.map((timezone) => (
    <div key={timezone} className="clock-card card">
    <button
    className="remove-btn"
    onClick={() => removeCity(timezone)}
    >
    <Trash2 size={16} />
    </button>

    <div className="clock-city">{getCityName(timezone)}</div>
    <div className="clock-time">{times[timezone] || '00:00:00'}</div>
    <div className="clock-timezone text-sm text-secondary">{timezone}</div>
    </div>
    ))
    )}
    </div>
    </div>
    );
};

export default WorldClock;
