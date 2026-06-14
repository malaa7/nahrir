import { create } from 'zustand';
import { playGlobalAlert, stopAllGlobalAlerts } from '../../utils/soundUtils';

// Helper function to format date as YYYY-MM-DD in local timezone
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Storage keys
const EVENTS_KEY = 'mero_events';
const TASKS_KEY = 'mero_tasks';
const SETTINGS_KEY = 'mero_settings';

// Load from localStorage
const loadFromStorage = (key, defaultValue) => {
    try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
    } catch {
    return defaultValue;
    }
};

// Save to localStorage
const saveToStorage = (key, data) => {
    try {
    localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
    console.error('Failed to save to storage:', error);
    }
};

const useMeroStore = create((set, get) => ({
    // Settings
    settings: loadFromStorage(SETTINGS_KEY, {
    alertVolume: 80,
    defaultReminderTime: 15,
    soundEnabled: true,
    }),
    updateSetting: (key, value) => {
    set((state) => {
    const newSettings = { ...state.settings, [key]: value };
    saveToStorage(SETTINGS_KEY, newSettings);
    return { settings: newSettings };
    });
    },

    // Selected Date - using local timezone
    selectedDate: formatLocalDate(new Date()),
    setSelectedDate: (date) => set({ selectedDate: date }),

    // Current View Month
    currentMonth: new Date(),
    setCurrentMonth: (date) => set({ currentMonth: date }),
    nextMonth: () => {
    const current = get().currentMonth;
    set({ currentMonth: new Date(current.getFullYear(), current.getMonth() + 1, 1) });
    },
    prevMonth: () => {
    const current = get().currentMonth;
    set({ currentMonth: new Date(current.getFullYear(), current.getMonth() - 1, 1) });
    },

    // Events
    events: loadFromStorage(EVENTS_KEY, []),
    setEvents: (events) => {
    set({ events });
    saveToStorage(EVENTS_KEY, events);
    },
    addEvent: (event) => {
    const newEvent = {
    ...event,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    };
    set((state) => {
    const newEvents = [...state.events, newEvent];
    saveToStorage(EVENTS_KEY, newEvents);
    return { events: newEvents };
    });
    return newEvent;
    },
    updateEvent: (id, event) => {
    set((state) => {
    const newEvents = state.events.map((e) => (e.id === id ? { ...e, ...event } : e));
    saveToStorage(EVENTS_KEY, newEvents);
    return { events: newEvents };
    });
    },
    deleteEvent: (id) => {
    set((state) => {
    const newEvents = state.events.filter((e) => e.id !== id);
    saveToStorage(EVENTS_KEY, newEvents);
    return { events: newEvents };
    });
    },

    // Tasks
    tasks: loadFromStorage(TASKS_KEY, []),
    setTasks: (tasks) => {
    set({ tasks });
    saveToStorage(TASKS_KEY, tasks);
    },
    addTask: (task) => {
    const newTask = {
    ...task,
    id: Date.now().toString(),
    completed: false,
    createdAt: new Date().toISOString(),
    };
    set((state) => {
    const newTasks = [...state.tasks, newTask];
    saveToStorage(TASKS_KEY, newTasks);
    return { tasks: newTasks };
    });
    return newTask;
    },
    updateTask: (id, task) => {
    set((state) => {
    const newTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t));
    saveToStorage(TASKS_KEY, newTasks);
    return { tasks: newTasks };
    });
    },
    deleteTask: (id) => {
    set((state) => {
    const newTasks = state.tasks.filter((t) => t.id !== id);
    saveToStorage(TASKS_KEY, newTasks);
    return { tasks: newTasks };
    });
    },
    toggleTaskComplete: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
    get().updateTask(id, { completed: !task.completed });
    }
    },

    // Task Filter
    taskFilter: 'all', // 'all' | 'active' | 'completed'
    setTaskFilter: (filter) => set({ taskFilter: filter }),

    // Modal States
    eventModalOpen: false,
    taskModalOpen: false,
    editingEvent: null,
    editingTask: null,

    openEventModal: (event = null) => set({ eventModalOpen: true, editingEvent: event }),
    closeEventModal: () => set({ eventModalOpen: false, editingEvent: null }),
    openTaskModal: (task = null) => set({ taskModalOpen: true, editingTask: task }),
    closeTaskModal: () => set({ taskModalOpen: false, editingTask: null }),

    // Track notified reminders (persists across component mounts)
    notifiedReminders: new Set(),
    addNotifiedReminder: (key) => {
    get().notifiedReminders.add(key);
    },
    hasBeenNotified: (key) => {
    return get().notifiedReminders.has(key);
    },

    // Alarm State
    alarmActive: false,
    alarmData: null,
    alarmAudio: null,

    triggerAlarm: (data) => {
    // Play notification sound if enabled
    let currentAudio = null;
    const playSound = () => {
    if (get().settings.soundEnabled) {
    currentAudio = playGlobalAlert(get().settings.alertVolume / 100);
    }
    };

    // Play pattern
    playSound();
    const alarmInterval = setInterval(() => {
    if (!get().alarmActive) {
    clearInterval(alarmInterval);
    return;
    }
    playSound();
    }, 2000); // Play every 2 seconds instead of 800ms for less annoyance

    set({
    alarmActive: true,
    alarmData: data,
    alarmAudio: { interval: alarmInterval, audioElement: currentAudio }
    });

    // Also show system notification
    if (window.electron) {
    window.electron.showNotification({
    title: data.title,
    body: data.body,
    silent: false, // Explicitly false for sound
    });
    } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(data.title, {
    body: data.body,
    icon: 'icon.png',
    silent: false,
    });
    }
    },

    dismissAlarm: () => {
    const state = get();

    // إيقاف الحلقة الصوتية فورًا
    if (state.alarmAudio?.interval) {
    clearInterval(state.alarmAudio.interval);
    }

    // إيقاف أي أصوات نشطة
    if (state.alarmAudio?.audioElement) {
    try {
    state.alarmAudio.audioElement.pause();
    state.alarmAudio.audioElement.currentTime = 0;
    state.alarmAudio.audioElement.src = '';
    state.alarmAudio.audioElement.load();
    } catch (error) {
    console.error('Error stopping alarm audio:', error);
    }
    }

    // إيقاف جميع الأصوات النشطة الأخرى
    stopAllGlobalAlerts();

    set({ alarmActive: false, alarmData: null, alarmAudio: null });
    },
}));

export default useMeroStore;
