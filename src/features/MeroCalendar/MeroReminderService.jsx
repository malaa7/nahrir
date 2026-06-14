import React, { useEffect } from 'react';
import useMeroStore from './meroStore';
import { useLanguage } from '../../contexts/LanguageContext';

// Helper function to format date as YYYY-MM-DD
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// This component runs reminder checks globally (should be placed in App.jsx)
function MeroReminderService() {
    const { language } = useLanguage();
    const {
    events,
    tasks,
    triggerAlarm,
    alarmActive,
    hasBeenNotified,
    addNotifiedReminder
    } = useMeroStore();

    useEffect(() => {
    const checkReminders = () => {
    if (alarmActive) return;

    const now = new Date();
    const todayStr = formatLocalDate(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Check events
    events.forEach(event => {
    if (!event.time || !event.date) return;
    if (event.date !== todayStr) return;

    const [hours, minutes] = event.time.split(':').map(Number);
    const eventMinutes = hours * 60 + minutes;

    // Notification at exact event time
    const atTimeKey = `event_at_${event.id}_${event.date}`;
    if (nowMinutes >= eventMinutes && nowMinutes < eventMinutes + 2) {
    if (!hasBeenNotified(atTimeKey)) {
    addNotifiedReminder(atTimeKey);
    triggerAlarm({
    title: language === 'ar' ? `🔔 حان الموعد: ${event.title}` : `🔔 Time: ${event.title}`,
    body: `⏰ ${event.time}${event.description ? `\n${event.description}` : ''}`,
    });
    }
    }

    // Reminder before event (if enabled)
    if (event.reminderEnabled) {
    const reminderMinutes = eventMinutes - (event.reminderBefore || 15);
    const beforeKey = `event_before_${event.id}_${event.date}`;

    if (nowMinutes >= reminderMinutes && nowMinutes < eventMinutes) {
    if (!hasBeenNotified(beforeKey)) {
    addNotifiedReminder(beforeKey);
    triggerAlarm({
    title: language === 'ar' ? `📅 تذكير: ${event.title}` : `📅 Reminder: ${event.title}`,
    body: `⏰ ${event.time}${event.description ? `\n${event.description}` : ''}`,
    });
    }
    }
    }
    });

    // Check tasks
    tasks.forEach(task => {
    if (!task.dueTime || !task.dueDate || task.completed) return;
    if (task.dueDate !== todayStr) return;

    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const taskMinutes = hours * 60 + minutes;

    // Notification at exact task time
    const atTimeKey = `task_at_${task.id}_${task.dueDate}`;
    if (nowMinutes >= taskMinutes && nowMinutes < taskMinutes + 2) {
    if (!hasBeenNotified(atTimeKey)) {
    addNotifiedReminder(atTimeKey);
    triggerAlarm({
    title: language === 'ar' ? `🔔 حان الموعد: ${task.title}` : `🔔 Time: ${task.title}`,
    body: `⏰ ${task.dueTime}${task.description ? `\n${task.description}` : ''}`,
    });
    }
    }

    // Reminder before task (if enabled)
    if (task.reminderEnabled) {
    const reminderMinutes = taskMinutes - (task.reminderBefore || 15);
    const beforeKey = `task_before_${task.id}_${task.dueDate}`;

    if (nowMinutes >= reminderMinutes && nowMinutes < taskMinutes) {
    if (!hasBeenNotified(beforeKey)) {
    addNotifiedReminder(beforeKey);
    triggerAlarm({
    title: language === 'ar' ? `✅ تذكير: ${task.title}` : `✅ Reminder: ${task.title}`,
    body: `⏰ ${task.dueTime}${task.description ? `\n${task.description}` : ''}`,
    });
    }
    }
    }
    });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
    }, [events, tasks, triggerAlarm, alarmActive, language, hasBeenNotified, addNotifiedReminder]);

    // This component doesn't render anything - it just runs the reminder service
    return null;
}

export default MeroReminderService;
