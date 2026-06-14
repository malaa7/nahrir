import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFocusStore = create(
    persist(
    (set, get) => ({
    mode: 'work',
    timeLeft: 25 * 60,
    isRunning: false,
    sessions: 0,
    settings: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
    },

    setMode: (mode) => {
    const { settings } = get();
    let time;
    if (mode === 'work') time = settings.workDuration * 60;
    else if (mode === 'break') time = settings.breakDuration * 60;
    else time = settings.longBreakDuration * 60;

    set({ mode, timeLeft: time, isRunning: false });
    },

    setTimeLeft: (timeLeft) => set({ timeLeft }),
    setIsRunning: (isRunning) => set({ isRunning }),
    setSessions: (sessions) => set({ sessions }),

    updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
    })),

    tick: () => {
    const { isRunning, timeLeft } = get();
    if (!isRunning) return null;

    if (timeLeft <= 1) {
    return get().completeSession();
    }

    set({ timeLeft: timeLeft - 1 });
    return null;
    },

    completeSession: () => {
    const { mode, sessions, settings } = get();
    let nextMode;
    let nextTime;
    let nextSessions = sessions;

    if (mode === 'work') {
    nextSessions = sessions + 1;
    if (nextSessions % settings.sessionsBeforeLongBreak === 0) {
    nextMode = 'longBreak';
    nextTime = settings.longBreakDuration * 60;
    } else {
    nextMode = 'break';
    nextTime = settings.breakDuration * 60;
    }
    } else {
    nextMode = 'work';
    nextTime = settings.workDuration * 60;
    }

    set({
    mode: nextMode,
    timeLeft: nextTime,
    isRunning: false,
    sessions: nextSessions
    });

    return { completedMode: mode, nextMode };
    },

    reset: () => {
    const { mode, settings } = get();
    let time;
    if (mode === 'work') time = settings.workDuration * 60;
    else if (mode === 'break') time = settings.breakDuration * 60;
    else time = settings.longBreakDuration * 60;

    set({ timeLeft: time, isRunning: false });
    }
    }),
    {
    name: 'focus-mode-storage',
    partialize: (state) => ({
    mode: state.mode,
    timeLeft: state.timeLeft,
    sessions: state.sessions,
    settings: state.settings,
    isRunning: state.isRunning
    })
    }
    )
);

export default useFocusStore;
