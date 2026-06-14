import axios from 'axios';

// Using AlAdhan API (free, no API key required)
const BASE_URL = 'https://api.aladhan.com/v1';

export const prayerApi = {
    async getPrayerTimes(city, country, method = 5) {
    try {
    const response = await axios.get(`${BASE_URL}/timingsByCity`, {
    params: {
    city,
    country,
    method,
    },
    });

    if (response.data.code === 200) {
    return {
    success: true,
    timings: response.data.data.timings,
    date: response.data.data.date,
    meta: response.data.data.meta,
    };
    }

    throw new Error('Failed to fetch prayer times');
    } catch (error) {
    console.error('Prayer times API error:', error);
    return {
    success: false,
    error: error.message,
    };
    }
    },

    async getPrayerTimesByCoordinates(latitude, longitude, method = 5) {
    try {
    const response = await axios.get(`${BASE_URL}/timings`, {
    params: {
    latitude,
    longitude,
    method,
    },
    });

    if (response.data.code === 200) {
    return {
    success: true,
    timings: response.data.data.timings,
    date: response.data.data.date,
    meta: response.data.data.meta,
    };
    }

    throw new Error('Failed to fetch prayer times');
    } catch (error) {
    console.error('Prayer times API error:', error);
    return {
    success: false,
    error: error.message,
    };
    }
    },

    // Calculation methods
    calculationMethods: [
    { id: 0, name: 'Shia Ithna-Ansari' },
    { id: 1, name: 'University of Islamic Sciences, Karachi' },
    { id: 2, name: 'Islamic Society of North America' },
    { id: 3, name: 'Muslim World League' },
    { id: 4, name: 'Umm Al-Qura University, Makkah' },
    { id: 5, name: 'Egyptian General Authority of Survey' },
    { id: 7, name: 'Institute of Geophysics, University of Tehran' },
    { id: 8, name: 'Gulf Region' },
    { id: 9, name: 'Kuwait' },
    { id: 10, name: 'Qatar' },
    { id: 11, name: 'Majlis Ugama Islam Singapura, Singapore' },
    { id: 12, name: 'Union Organization islamic de France' },
    { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
    ],

    // Popular cities
    popularLocations: [
    { city: 'Cairo', country: 'Egypt', nameAr: 'القاهرة' },
    { city: 'Alexandria', country: 'Egypt', nameAr: 'الإسكندرية' },
    { city: 'Makkah', country: 'Saudi Arabia', nameAr: 'مكة المكرمة' },
    { city: 'Madinah', country: 'Saudi Arabia', nameAr: 'المدينة المنورة' },
    { city: 'Riyadh', country: 'Saudi Arabia', nameAr: 'الرياض' },
    { city: 'Jeddah', country: 'Saudi Arabia', nameAr: 'جدة' },
    { city: 'Dubai', country: 'United Arab Emirates', nameAr: 'دبي' },
    { city: 'Abu Dhabi', country: 'United Arab Emirates', nameAr: 'أبو ظبي' },
    { city: 'Doha', country: 'Qatar', nameAr: 'الدوحة' },
    { city: 'Kuwait City', country: 'Kuwait', nameAr: 'الكويت' },
    { city: 'Amman', country: 'Jordan', nameAr: 'عمّان' },
    { city: 'Muscat', country: 'Oman', nameAr: 'مسقط' },
    { city: 'Manama', country: 'Bahrain', nameAr: 'المنامة' },
    { city: 'Beirut', country: 'Lebanon', nameAr: 'بيروت' },
    { city: 'Damascus', country: 'Syria', nameAr: 'دمشق' },
    { city: 'Baghdad', country: 'Iraq', nameAr: 'بغداد' },
    { city: 'Jerusalem', country: 'Palestine', nameAr: 'القدس' },
    { city: 'Gaza', country: 'Palestine', nameAr: 'غزة' },
    { city: 'Sanaa', country: 'Yemen', nameAr: 'صنعاء' },
    { city: 'Khartoum', country: 'Sudan', nameAr: 'الخرطوم' },
    { city: 'Tripoli', country: 'Libya', nameAr: 'طرابلس' },
    { city: 'Tunis', country: 'Tunisia', nameAr: 'تونس' },
    { city: 'Algiers', country: 'Algeria', nameAr: 'الجزائر' },
    { city: 'Rabat', country: 'Morocco', nameAr: 'الرباط' },
    { city: 'Casablanca', country: 'Morocco', nameAr: 'الدار البيضاء' },
    { city: 'Nouakchott', country: 'Mauritania', nameAr: 'نواكشوط' },
    { city: 'Mogadishu', country: 'Somalia', nameAr: 'مقديشو' },
    { city: 'Djibouti', country: 'Djibouti', nameAr: 'جيبوتي' },
    { city: 'Moroni', country: 'Comoros', nameAr: 'موروني' },
    { city: 'Istanbul', country: 'Turkey', nameAr: 'إسطنبول' },
    { city: 'Ankara', country: 'Turkey', nameAr: 'أنقرة' },
    { city: 'Tehran', country: 'Iran', nameAr: 'طهران' },
    { city: 'Islamabad', country: 'Pakistan', nameAr: 'إسلام آباد' },
    { city: 'Jakarta', country: 'Indonesia', nameAr: 'جاكرتا' },
    { city: 'Kuala Lumpur', country: 'Malaysia', nameAr: 'كوالالمبور' },
    { city: 'London', country: 'United Kingdom', nameAr: 'لندن' },
    { city: 'Paris', country: 'France', nameAr: 'باريس' },
    { city: 'Berlin', country: 'Germany', nameAr: 'برلين' },
    { city: 'Madrid', country: 'Spain', nameAr: 'مدريد' },
    { city: 'Rome', country: 'Italy', nameAr: 'روما' },
    { city: 'Moscow', country: 'Russia', nameAr: 'موسكو' },
    { city: 'New York', country: 'USA', nameAr: 'نيويورك' },
    { city: 'Washington', country: 'USA', nameAr: 'واشنطن' },
    ],

    // Get the next prayer time
    getNextPrayer(timings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
    { name: 'Fajr', time: timings.Fajr },
    { name: 'Dhuhr', time: timings.Dhuhr },
    { name: 'Asr', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isha', time: timings.Isha },
    ];

    const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
    };

    for (const prayer of prayers) {
    const prayerTime = parseTime(prayer.time);
    if (prayerTime > currentTime) {
    return {
    name: prayer.name,
    time: prayer.time,
    minutesRemaining: prayerTime - currentTime,
    };
    }
    }

    // If no prayer left today, return Fajr of tomorrow
    return {
    name: 'Fajr',
    time: timings.Fajr,
    minutesRemaining: 24 * 60 - currentTime + parseTime(timings.Fajr),
    };
    },
};
