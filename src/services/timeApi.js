import axios from 'axios';

// Using World Time API (free, no API key required)
const BASE_URL = 'http://worldtimeapi.org/api/timezone';

export const timeApi = {
    async getTimeForZone(timezone) {
    try {
    const response = await axios.get(`${BASE_URL}/${timezone}`);
    return {
    success: true,
    timezone: response.data.timezone,
    datetime: response.data.datetime,
    utc_offset: response.data.utc_offset,
    day_of_week: response.data.day_of_week,
    day_of_year: response.data.day_of_year,
    };
    } catch (error) {
    console.error('Time API error:', error);
    return {
    success: false,
    error: error.message,
    };
    }
    },

    async getAllZones() {
    try {
    const response = await axios.get('http://worldtimeapi.org/api/timezone');
    return {
    success: true,
    timezones: response.data,
    };
    } catch (error) {
    console.error('Time zones API error:', error);
    return {
    success: false,
    error: error.message,
    };
    }
    },

    // Popular cities with their timezones
    popularCities: [
    // Middle East & Arab World
    { name: 'القاهرة', nameEn: 'Cairo', timezone: 'Africa/Cairo' },
    { name: 'مكة المكرمة', nameEn: 'Makkah', timezone: 'Asia/Riyadh' },
    { name: 'الرياض', nameEn: 'Riyadh', timezone: 'Asia/Riyadh' },
    { name: 'جدة', nameEn: 'Jeddah', timezone: 'Asia/Riyadh' },
    { name: 'المدينة المنورة', nameEn: 'Madinah', timezone: 'Asia/Riyadh' },
    { name: 'دبي', nameEn: 'Dubai', timezone: 'Asia/Dubai' },
    { name: 'أبو ظبي', nameEn: 'Abu Dhabi', timezone: 'Asia/Dubai' },
    { name: 'الدوحة', nameEn: 'Doha', timezone: 'Asia/Qatar' },
    { name: 'الكويت', nameEn: 'Kuwait City', timezone: 'Asia/Kuwait' },
    { name: 'المنامة', nameEn: 'Manama', timezone: 'Asia/Bahrain' },
    { name: 'مسقط', nameEn: 'Muscat', timezone: 'Asia/Muscat' },
    { name: 'عمان', nameEn: 'Amman', timezone: 'Asia/Amman' },
    { name: 'بيروت', nameEn: 'Beirut', timezone: 'Asia/Beirut' },
    { name: 'دمشق', nameEn: 'Damascus', timezone: 'Asia/Damascus' },
    { name: 'بغداد', nameEn: 'Baghdad', timezone: 'Asia/Baghdad' },
    { name: 'القدس', nameEn: 'Jerusalem', timezone: 'Asia/Jerusalem' },
    { name: 'صنعاء', nameEn: 'Sana\'a', timezone: 'Asia/Aden' },
    { name: 'الخرطوم', nameEn: 'Khartoum', timezone: 'Africa/Khartoum' },
    { name: 'طرابلس', nameEn: 'Tripoli', timezone: 'Africa/Tripoli' },
    { name: 'تونس', nameEn: 'Tunis', timezone: 'Africa/Tunis' },
    { name: 'الجزائر', nameEn: 'Algiers', timezone: 'Africa/Algiers' },
    { name: 'الدار البيضاء', nameEn: 'Casablanca', timezone: 'Africa/Casablanca' },
    { name: 'الرباط', nameEn: 'Rabat', timezone: 'Africa/Casablanca' },
    { name: 'نواكشوط', nameEn: 'Nouakchott', timezone: 'Africa/Nouakchott' },
    { name: 'جيبوتي', nameEn: 'Djibouti', timezone: 'Africa/Djibouti' },
    { name: 'مقديشو', nameEn: 'Mogadishu', timezone: 'Africa/Mogadishu' },

    // Europe
    { name: 'لندن', nameEn: 'London', timezone: 'Europe/London' },
    { name: 'باريس', nameEn: 'Paris', timezone: 'Europe/Paris' },
    { name: 'برلين', nameEn: 'Berlin', timezone: 'Europe/Berlin' },
    { name: 'مدريد', nameEn: 'Madrid', timezone: 'Europe/Madrid' },
    { name: 'روما', nameEn: 'Rome', timezone: 'Europe/Rome' },
    { name: 'إسطنبول', nameEn: 'Istanbul', timezone: 'Europe/Istanbul' },
    { name: 'موسكو', nameEn: 'Moscow', timezone: 'Europe/Moscow' },
    { name: 'أمستردام', nameEn: 'Amsterdam', timezone: 'Europe/Amsterdam' },
    { name: 'بروكسل', nameEn: 'Brussels', timezone: 'Europe/Brussels' },
    { name: 'فيينا', nameEn: 'Vienna', timezone: 'Europe/Vienna' },
    { name: 'زيورخ', nameEn: 'Zurich', timezone: 'Europe/Zurich' },
    { name: 'ستوكهولم', nameEn: 'Stockholm', timezone: 'Europe/Stockholm' },
    { name: 'أوسلو', nameEn: 'Oslo', timezone: 'Europe/Oslo' },
    { name: 'كوبنهاجن', nameEn: 'Copenhagen', timezone: 'Europe/Copenhagen' },
    { name: 'أثينا', nameEn: 'Athens', timezone: 'Europe/Athens' },
    { name: 'لشبونة', nameEn: 'Lisbon', timezone: 'Europe/Lisbon' },

    // Asia
    { name: 'طوكيو', nameEn: 'Tokyo', timezone: 'Asia/Tokyo' },
    { name: 'بكين', nameEn: 'Beijing', timezone: 'Asia/Shanghai' },
    { name: 'سيول', nameEn: 'Seoul', timezone: 'Asia/Seoul' },
    { name: 'نيودلهي', nameEn: 'New Delhi', timezone: 'Asia/Kolkata' },
    { name: 'مومباي', nameEn: 'Mumbai', timezone: 'Asia/Kolkata' },
    { name: 'بانكوك', nameEn: 'Bangkok', timezone: 'Asia/Bangkok' },
    { name: 'سنغافورة', nameEn: 'Singapore', timezone: 'Asia/Singapore' },
    { name: 'جاكرتا', nameEn: 'Jakarta', timezone: 'Asia/Jakarta' },
    { name: 'كوالالمبور', nameEn: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur' },
    { name: 'إسلام آباد', nameEn: 'Islamabad', timezone: 'Asia/Karachi' },
    { name: 'طهران', nameEn: 'Tehran', timezone: 'Asia/Tehran' },
    { name: 'كابل', nameEn: 'Kabul', timezone: 'Asia/Kabul' },
    { name: 'مانيلا', nameEn: 'Manila', timezone: 'Asia/Manila' },

    // America
    { name: 'نيويورك', nameEn: 'New York', timezone: 'America/New_York' },
    { name: 'واشنطن', nameEn: 'Washington D.C.', timezone: 'America/New_York' },
    { name: 'لوس أنجلوس', nameEn: 'Los Angeles', timezone: 'America/Los_Angeles' },
    { name: 'شيكاغو', nameEn: 'Chicago', timezone: 'America/Chicago' },
    { name: 'تورونتو', nameEn: 'Toronto', timezone: 'America/Toronto' },
    { name: 'أوتاوا', nameEn: 'Ottawa', timezone: 'America/Toronto' },
    { name: 'مكسيكو سيتي', nameEn: 'Mexico City', timezone: 'America/Mexico_City' },
    { name: 'بوينس آيرس', nameEn: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
    { name: 'ساو باولو', nameEn: 'Sao Paulo', timezone: 'America/Sao_Paulo' },
    { name: 'ريو دي جانيرو', nameEn: 'Rio de Janeiro', timezone: 'America/Sao_Paulo' },
    { name: 'سانتياغو', nameEn: 'Santiago', timezone: 'America/Santiago' },

    // Africa (Others)
    { name: 'نيروبي', nameEn: 'Nairobi', timezone: 'Africa/Nairobi' },
    { name: 'جوهانسبرغ', nameEn: 'Johannesburg', timezone: 'Africa/Johannesburg' },
    { name: 'لاغوس', nameEn: 'Lagos', timezone: 'Africa/Lagos' },
    { name: 'أديس أبابا', nameEn: 'Addis Ababa', timezone: 'Africa/Addis_Ababa' },

    // Australia & Pacific
    { name: 'سيدني', nameEn: 'Sydney', timezone: 'Australia/Sydney' },
    { name: 'ملبورن', nameEn: 'Melbourne', timezone: 'Australia/Melbourne' },
    { name: 'بيرث', nameEn: 'Perth', timezone: 'Australia/Perth' },
    { name: 'أوكلاند', nameEn: 'Auckland', timezone: 'Pacific/Auckland' },
    ],

    // Calculate time difference in hours
    calculateTimeDifference(offset1, offset2) {
    // Offsets are in format "+02:00" or "-05:00"
    const parseOffset = (offset) => {
    const sign = offset[0] === '+' ? 1 : -1;
    const [hours, minutes] = offset.slice(1).split(':').map(Number);
    return sign * (hours + minutes / 60);
    };

    const diff = parseOffset(offset1) - parseOffset(offset2);
    return diff;
    },
};
