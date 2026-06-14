import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePrayerStore = create(
    persist(
    (set) => ({
    settings: {
    city: 'Cairo',
    country: 'Egypt',
    method: 5,
    notificationsEnabled: true,
    azanEnabled: true,
    volume: 1.0
    },
    timings: null,
    nextPrayer: null,
    loading: false,
    activeAzan: null, // Current playing audio instance

    setSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
    })),

    setTimings: (timings) => set({ timings }),

    setNextPrayer: (nextPrayer) => set({ nextPrayer }),

    setLoading: (loading) => set({ loading }),

    setActiveAzan: (audio) => set({ activeAzan: audio }),

    stopAzan: () => set((state) => {
    if (state.activeAzan) {
    try {
    // إيقاف التشغيل فورًا
    state.activeAzan.pause();
    // إعادة الوقت للبداية
    state.activeAzan.currentTime = 0;
    // إزالة المصدر لضمان التوقف الكامل
    state.activeAzan.src = '';
    // تحميل من جديد لإيقاف أي عمليات معلقة
    state.activeAzan.load();
    } catch (error) {
    console.error('Error stopping Azan:', error);
    }
    }
    return { activeAzan: null };
    }),

    toggleNotifications: () => set((state) => ({
    settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled }
    })),

    toggleAzan: () => set((state) => ({
    settings: { ...state.settings, azanEnabled: !state.settings.azanEnabled }
    })),
    }),
    {
    name: 'prayer-times-storage',
    storage: {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => localStorage.setItem(name, value),
    removeItem: (name) => localStorage.removeItem(name),
    },
    partialize: (state) => {
    const { activeAzan, ...rest } = state;
    return rest;
    },
    }
    )
);

export default usePrayerStore;
