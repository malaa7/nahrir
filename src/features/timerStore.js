import { create } from 'zustand';

const useTimerStore = create((set, get) => ({
    mode: 'stopwatch',
    time: 0,
    isRunning: false,
    countdownInput: { minutes: 0, seconds: 0 },
    lastTimestamp: null,

    setMode: (mode) => set({ mode, time: 0, isRunning: false }),
    setTime: (time) => set({ time }),
    setIsRunning: (isRunning) => set({ isRunning, lastTimestamp: isRunning ? Date.now() : null }),
    setCountdownInput: (input) => set({ countdownInput: input }),

    tick: () => {
    const { mode, time, isRunning } = get();
    if (!isRunning) return;

    if (mode === 'stopwatch') {
    set({ time: time + 1 });
    } else {
    if (time <= 1) {
    set({ time: 0, isRunning: false });
    return true; // Finished
    }
    set({ time: time - 1 });
    }
    return false;
    },

    reset: () => set({ time: 0, isRunning: false }),

    startCountdown: () => {
    const { countdownInput } = get();
    const totalSeconds = (parseInt(countdownInput.minutes) || 0) * 60 + (parseInt(countdownInput.seconds) || 0);
    if (totalSeconds > 0) {
    set({ time: totalSeconds, isRunning: true, mode: 'countdown', lastTimestamp: Date.now() });
    }
    },

    // Handle background synchronization
    syncFromBackground: () => {
    const { isRunning, lastTimestamp, time, mode } = get();
    if (isRunning && lastTimestamp) {
    const elapsed = Math.floor((Date.now() - lastTimestamp) / 1000);
    if (mode === 'stopwatch') {
    set({ time: time + elapsed, lastTimestamp: Date.now() });
    } else {
    const newTime = Math.max(0, time - elapsed);
    set({ time: newTime, lastTimestamp: Date.now() });
    if (newTime === 0) {
    set({ isRunning: false });
    return true;
    }
    }
    }
    return false;
    }
}));

export default useTimerStore;
