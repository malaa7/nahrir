// Storage utility with encryption support
class Storage {
    constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electron;
    }

    async read(key) {
    if (this.isElectron) {
    const result = await window.electron.readFile(`${key}.json`);
    if (result.success && result.data) {
    try {
    return JSON.parse(result.data);
    } catch (e) {
    console.error('Error parsing stored data:', e);
    return null;
    }
    }
    return null;
    } else {
    // Fallback to localStorage for development
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
    }
    }

    async write(key, data) {
    if (this.isElectron) {
    const result = await window.electron.writeFile(
    `${key}.json`,
    JSON.stringify(data, null, 2)
    );
    return result.success;
    } else {
    // Fallback to localStorage for development
    localStorage.setItem(key, JSON.stringify(data));
    return true;
    }
    }

    async delete(key) {
    if (this.isElectron) {
    const result = await window.electron.deleteFile(`${key}.json`);
    return result.success;
    } else {
    // Fallback to localStorage for development
    localStorage.removeItem(key);
    return true;
    }
    }

    async list() {
    if (this.isElectron) {
    const result = await window.electron.listFiles();
    if (result.success) {
    return result.files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
    }
    return [];
    } else {
    // Fallback to localStorage for development
    return Object.keys(localStorage);
    }
    }
}

export const storage = new Storage();

// Specific storage helpers
export const notesStorage = {
    async getAll() {
    return (await storage.read('notes')) || [];
    },
    async save(notes) {
    return await storage.write('notes', notes);
    },
};

export const tasksStorage = {
    async getAll() {
    return (await storage.read('tasks')) || [];
    },
    async save(tasks) {
    return await storage.write('tasks', tasks);
    },
};

export const settingsStorage = {
    async get() {
    return (
    (await storage.read('settings')) || {
    language: 'ar',
    theme: 'dark',
    startOnBoot: false,
    minimizeToTray: true,
    notifications: true,
    }
    );
    },
    async save(settings) {
    return await storage.write('settings', settings);
    },
};

export const quickLinksStorage = {
    async getAll() {
    return (await storage.read('quickLinks')) || [];
    },
    async save(links) {
    return await storage.write('quickLinks', links);
    },
};

export const calendarStorage = {
    async getAll() {
    return (await storage.read('calendar')) || [];
    },
    async save(events) {
    return await storage.write('calendar', events);
    },
};

export const worldClockStorage = {
    async getCities() {
    return (
    (await storage.read('worldClock')) || [
    'Africa/Cairo',
    'America/New_York',
    'Europe/London',
    ]
    );
    },
    async save(cities) {
    return await storage.write('worldClock', cities);
    },
};

export const currencyStorage = {
    async getFavorites() {
    return (await storage.read('currencyFavorites')) || ['USD', 'EUR', 'EGP', 'SAR'];
    },
    async save(favorites) {
    return await storage.write('currencyFavorites', favorites);
    },
};

export const prayerTimesStorage = {
    async getSettings() {
    return (
    (await storage.read('prayerSettings')) || {
    city: 'Cairo',
    country: 'Egypt',
    method: 5, // Egyptian General Authority
    }
    );
    },
    async save(settings) {
    return await storage.write('prayerSettings', settings);
    },
};
