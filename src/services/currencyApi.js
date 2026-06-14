import axios from 'axios';

// Using Exchange Rates API (free tier, no API key required)
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export const currencyApi = {
    async getExchangeRates(baseCurrency = 'USD') {
    try {
    const response = await axios.get(`${BASE_URL}/${baseCurrency}`);
    return {
    success: true,
    base: response.data.base,
    rates: response.data.rates,
    lastUpdated: response.data.date,
    };
    } catch (error) {
    console.error('Currency API error:', error);
    return {
    success: false,
    error: error.message,
    };
    }
    },

    async convert(amount, from, to) {
    try {
    const response = await axios.get(`${BASE_URL}/${from}`);
    const rate = response.data.rates[to];

    if (!rate) {
    throw new Error('Invalid currency code');
    }

    return {
    success: true,
    amount: amount,
    from: from,
    to: to,
    rate: rate,
    result: amount * rate,
    lastUpdated: response.data.date,
    };
    } catch (error) {
    console.error('Currency conversion error:', error);
    return {
    success: false,
    error: error.message,
    };
    }
    },

    // Popular currencies
    popularCurrencies: [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '?' },
    { code: 'GBP', name: 'British Pound', symbol: '?' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '?' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E?' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'L?' },
    { code: 'SYP', name: 'Syrian Pound', symbol: 'SYP' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '?' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '?' },
    { code: 'INR', name: 'Indian Rupee', symbol: '?' },
    ],
};
