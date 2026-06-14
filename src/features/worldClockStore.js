import { create } from 'zustand';
import { worldClockStorage } from '../utils/storage';

const useWorldClockStore = create((set, get) => ({
    cities: [],

    loadCities: async () => {
    const saved = await worldClockStorage.getCities();
    set({ cities: saved || [] });
    },

    addCity: async (timezone) => {
    const { cities } = get();
    if (timezone && !cities.includes(timezone)) {
    const newCities = [...cities, timezone];
    set({ cities: newCities });
    await worldClockStorage.save(newCities);
    return true;
    }
    return false;
    },

    removeCity: async (timezone) => {
    const { cities } = get();
    const newCities = cities.filter(c => c !== timezone);
    set({ cities: newCities });
    await worldClockStorage.save(newCities);
    }
}));

export default useWorldClockStore;
