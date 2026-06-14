import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { currencyApi } from '../services/currencyApi';
import { currencyStorage } from '../utils/storage';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
    const { t } = useLanguage();
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EGP');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
    loadFavorites();
    }, []);

    const loadFavorites = async () => {
    const favs = await currencyStorage.getFavorites();
    setFavorites(favs);
    };

    const handleConvert = async () => {
    setLoading(true);
    const response = await currencyApi.convert(amount, fromCurrency, toCurrency);

    if (response.success) {
    setResult(response);
    setLastUpdated(response.lastUpdated);
    } else {
    alert(`${t('error')}: ${response.error}`);
    }

    setLoading(false);
    };

    const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
    };

    const toggleFavorite = async (currencyCode) => {
    let newFavorites;
    if (favorites.includes(currencyCode)) {
    newFavorites = favorites.filter((c) => c !== currencyCode);
    } else {
    newFavorites = [...favorites, currencyCode];
    }

    setFavorites(newFavorites);
    await currencyStorage.save(newFavorites);
    };

    return (
    <div className="currency-converter fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('currencyConverter')}</h1>
    <p className="text-secondary">{t('currencyDescription')}</p>
    </header>

    <div className="converter-card card">
    <div className="input-group">
    <label>{t('amount')}</label>
    <input
    type="number"
    className="input"
    value={amount}
    onChange={(e) => setAmount(Number(e.target.value))}
    min="0"
    step="0.01"
    />
    </div>

    <div className="currency-row">
    <div className="currency-select">
    <label>{t('from')}</label>
    <select
    className="input"
    value={fromCurrency}
    onChange={(e) => setFromCurrency(e.target.value)}
    >
    {currencyApi.popularCurrencies.map((curr) => (
    <option key={curr.code} value={curr.code}>
    {curr.symbol} {curr.code} - {curr.name}
    </option>
    ))}
    </select>
    </div>

    <button className="swap-btn btn-icon" onClick={swapCurrencies}>
    <ArrowRightLeft size={20} />
    </button>

    <div className="currency-select">
    <label>{t('to')}</label>
    <select
    className="input"
    value={toCurrency}
    onChange={(e) => setToCurrency(e.target.value)}
    >
    {currencyApi.popularCurrencies.map((curr) => (
    <option key={curr.code} value={curr.code}>
    {curr.symbol} {curr.code} - {curr.name}
    </option>
    ))}
    </select>
    </div>
    </div>

    <button className="btn btn-primary convert-btn" onClick={handleConvert} disabled={loading}>
    {loading ? t('loading') : t('convert')}
    </button>

    {result && (
    <div className="result-box">
    <div className="result-amount">
    {result.amount.toLocaleString()} {result.from} =
    </div>
    <div className="result-value">
    {result.result.toFixed(2).toLocaleString()} {result.to}
    </div>
    <div className="result-rate text-secondary text-sm">
    {t('exchangeRate')}: 1 {result.from} = {result.rate.toFixed(4)} {result.to}
    </div>
    {lastUpdated && (
    <div className="text-secondary text-sm">
    {t('lastUpdated')}: {lastUpdated}
    </div>
    )}
    </div>
    )}
    </div>

    <div className="favorites-section mt-lg">
    <h2 className="text-xl font-semibold mb-md">{t('favorites')}</h2>
    <div className="favorites-grid">
    {currencyApi.popularCurrencies.slice(0, 12).map((curr) => (
    <button
    key={curr.code}
    className={`favorite-card card ${favorites.includes(curr.code) ? 'favorite-active' : ''}`}
    onClick={() => toggleFavorite(curr.code)}
    >
    <div className="favorite-icon">
    <Star
    size={20}
    fill={favorites.includes(curr.code) ? 'currentColor' : 'none'}
    />
    </div>
    <div className="favorite-info">
    <div className="favorite-code">{curr.code}</div>
    <div className="favorite-name text-sm text-secondary">{curr.name}</div>
    </div>
    </button>
    ))}
    </div>
    </div>
    </div>
    );
};

export default CurrencyConverter;
