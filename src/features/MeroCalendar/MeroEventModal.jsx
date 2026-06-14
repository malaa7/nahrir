import React, { useState, useEffect } from 'react';
import useMeroStore from './meroStore';
import { useLanguage } from '../../contexts/LanguageContext';

const eventColors = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#06b6d4', // Cyan
];

function MeroEventModal() {
    const { language } = useLanguage();
    const {
    eventModalOpen,
    closeEventModal,
    editingEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    settings
    } = useMeroStore();

    const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    reminderEnabled: true,
    reminderBefore: 15,
    color: '#6366f1',
    recurrence: 'none',
    });

    const t = {
    newEvent: language === 'ar' ? 'حدث جديد' : 'New Event',
    editEvent: language === 'ar' ? 'تعديل الحدث' : 'Edit Event',
    title: language === 'ar' ? 'العنوان' : 'Title',
    titlePlaceholder: language === 'ar' ? 'عنوان الحدث' : 'Event title',
    date: language === 'ar' ? 'التاريخ' : 'Date',
    startTime: language === 'ar' ? 'وقت البداية' : 'Start Time',
    endTime: language === 'ar' ? 'وقت النهاية' : 'End Time',
    description: language === 'ar' ? 'الوصف' : 'Description',
    descPlaceholder: language === 'ar' ? 'أضف وصفاً...' : 'Add description...',
    repeat: language === 'ar' ? 'التكرار' : 'Repeat',
    noRepeat: language === 'ar' ? 'لا يتكرر' : 'Does not repeat',
    weekly: language === 'ar' ? 'يتكرر كل أسبوع' : 'Repeat every week',
    weeklyNote: language === 'ar' ? 'سيتكرر هذا الحدث كل أسبوع في نفس اليوم' : 'This event will repeat every week on the same day',
    color: language === 'ar' ? 'اللون' : 'Color',
    reminder: language === 'ar' ? 'تذكير' : 'Reminder',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    save: language === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    add: language === 'ar' ? 'إضافة حدث' : 'Add Event',
    delete: language === 'ar' ? 'حذف الحدث' : 'Delete Event',
    required: language === 'ar' ? 'مطلوب' : 'Required',
    };

    const reminderOptions = {
    5: language === 'ar' ? 'قبل 5 دقائق' : '5 minutes before',
    10: language === 'ar' ? 'قبل 10 دقائق' : '10 minutes before',
    15: language === 'ar' ? 'قبل 15 دقيقة' : '15 minutes before',
    30: language === 'ar' ? 'قبل 30 دقيقة' : '30 minutes before',
    60: language === 'ar' ? 'قبل ساعة واحدة' : '1 hour before',
    120: language === 'ar' ? 'قبل ساعتين' : '2 hours before',
    1440: language === 'ar' ? 'قبل يوم واحد' : '1 day before',
    };

    useEffect(() => {
    if (editingEvent) {
    if (editingEvent.id) {
    setFormData({
    title: editingEvent.title || '',
    description: editingEvent.description || '',
    date: editingEvent.date || '',
    time: editingEvent.time || '',
    endTime: editingEvent.endTime || '',
    reminderEnabled: editingEvent.reminderEnabled ?? true,
    reminderBefore: editingEvent.reminderBefore || settings.defaultReminderTime,
    color: editingEvent.color || '#6366f1',
    recurrence: editingEvent.recurrence || 'none',
    });
    } else {
    setFormData({
    title: '',
    description: '',
    date: editingEvent.date || new Date().toISOString().split('T')[0],
    time: '',
    endTime: '',
    reminderEnabled: true,
    reminderBefore: settings.defaultReminderTime,
    color: '#6366f1',
    recurrence: 'none',
    });
    }
    }
    }, [editingEvent, settings.defaultReminderTime]);

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) return;

    if (editingEvent?.id) {
    updateEvent(editingEvent.id, formData);
    } else {
    addEvent(formData);
    }
    closeEventModal();
    };

    const handleDelete = () => {
    if (editingEvent?.id) {
    deleteEvent(editingEvent.id);
    closeEventModal();
    }
    };

    if (!eventModalOpen) return null;

    return (
    <div className="mero-modal-overlay" onClick={closeEventModal}>
    <div className="mero-modal" onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div className="mero-modal-header">
    <h2 className="mero-modal-title">
    {editingEvent?.id ? t.editEvent : t.newEvent}
    </h2>
    <button onClick={closeEventModal} className="mero-modal-close">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
    </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="mero-modal-form">
    {/* Title */}
    <div className="mero-form-group">
    <label>{t.title} *</label>
    <input
    type="text"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    placeholder={t.titlePlaceholder}
    required
    className="mero-form-input"
    />
    </div>

    {/* Date & Time */}
    <div className="mero-form-row">
    <div className="mero-form-group">
    <label>{t.date} *</label>
    <input
    type="date"
    value={formData.date}
    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
    required
    className="mero-form-input"
    />
    </div>
    <div className="mero-form-group">
    <label>{t.startTime}</label>
    <input
    type="time"
    value={formData.time}
    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
    className="mero-form-input"
    />
    </div>
    <div className="mero-form-group">
    <label>{t.endTime}</label>
    <input
    type="time"
    value={formData.endTime}
    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
    className="mero-form-input"
    />
    </div>
    </div>

    {/* Description */}
    <div className="mero-form-group">
    <label>{t.description}</label>
    <textarea
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    placeholder={t.descPlaceholder}
    rows={3}
    className="mero-form-input"
    />
    </div>

    {/* Recurrence */}
    <div className="mero-form-group">
    <label>{t.repeat}</label>
    <select
    value={formData.recurrence}
    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
    className="mero-form-input"
    >
    <option value="none">{t.noRepeat}</option>
    <option value="weekly">{t.weekly}</option>
    </select>
    {formData.recurrence === 'weekly' && (
    <p className="mero-recurrence-note">{t.weeklyNote}</p>
    )}
    </div>

    {/* Color */}
    <div className="mero-form-group">
    <label>{t.color}</label>
    <div className="mero-color-options">
    {eventColors.map((color) => (
    <button
    key={color}
    type="button"
    onClick={() => setFormData({ ...formData, color })}
    className={`mero-color-btn ${formData.color === color ? 'selected' : ''}`}
    style={{ backgroundColor: color }}
    />
    ))}
    </div>
    </div>

    {/* Reminder */}
    <div className="mero-reminder-section">
    <div className="mero-reminder-header">
    <label>{t.reminder}</label>
    <button
    type="button"
    onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
    className={`mero-toggle ${formData.reminderEnabled ? 'active' : ''}`}
    >
    <div className="mero-toggle-knob"></div>
    </button>
    </div>
    {formData.reminderEnabled && (
    <select
    value={formData.reminderBefore}
    onChange={(e) => setFormData({ ...formData, reminderBefore: parseInt(e.target.value) })}
    className="mero-form-input"
    >
    {Object.entries(reminderOptions).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
    ))}
    </select>
    )}
    </div>

    {/* Actions */}
    <div className="mero-modal-actions">
    {editingEvent?.id && (
    <button type="button" onClick={handleDelete} className="mero-delete-btn">
    {t.delete}
    </button>
    )}
    <div className={`mero-action-btns ${editingEvent?.id ? '' : 'ml-auto'}`} style={{ marginLeft: editingEvent?.id ? '' : 'auto' }}>
    <button type="button" onClick={closeEventModal} className="mero-cancel-btn">
    {t.cancel}
    </button>
    <button type="submit" className="mero-submit-btn">
    {editingEvent?.id ? t.save : t.add}
    </button>
    </div>
    </div>
    </form>
    </div>
    </div>
    );
}

export default MeroEventModal;
