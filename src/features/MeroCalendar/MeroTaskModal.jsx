import React, { useState, useEffect } from 'react';
import useMeroStore from './meroStore';
import { useLanguage } from '../../contexts/LanguageContext';

function MeroTaskModal() {
    const { language } = useLanguage();
    const {
    taskModalOpen,
    closeTaskModal,
    editingTask,
    addTask,
    updateTask,
    deleteTask,
    settings
    } = useMeroStore();

    const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    reminderEnabled: false,
    reminderBefore: 15,
    });

    const t = {
    newTask: language === 'ar' ? 'مهمة جديدة' : 'New Task',
    editTask: language === 'ar' ? 'تعديل المهمة' : 'Edit Task',
    title: language === 'ar' ? 'عنوان المهمة' : 'Task Title',
    titlePlaceholder: language === 'ar' ? 'ما الذي يجب القيام به؟' : 'What needs to be done?',
    description: language === 'ar' ? 'الوصف' : 'Description',
    descPlaceholder: language === 'ar' ? 'أضف المزيد من التفاصيل...' : 'Add more details...',
    dueDate: language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date',
    dueTime: language === 'ar' ? 'وقت الاستحقاق' : 'Due Time',
    priority: language === 'ar' ? 'الأولوية' : 'Priority',
    low: language === 'ar' ? 'منخفضة' : 'Low',
    medium: language === 'ar' ? 'متوسطة' : 'Medium',
    high: language === 'ar' ? 'عالية' : 'High',
    reminder: language === 'ar' ? 'ضبط تذكير' : 'Set Reminder',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    save: language === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    add: language === 'ar' ? 'إضافة مهمة' : 'Add Task',
    delete: language === 'ar' ? 'حذف المهمة' : 'Delete Task',
    required: language === 'ar' ? 'مطلوب' : 'Required',
    };

    const reminderOptions = {
    5: language === 'ar' ? 'قبل 5 دقائق' : '5 minutes before',
    10: language === 'ar' ? 'قبل 10 دقائق' : '10 minutes before',
    15: language === 'ar' ? 'قبل 15 دقيقة' : '15 minutes before',
    30: language === 'ar' ? 'قبل 30 دقيقة' : '30 minutes before',
    60: language === 'ar' ? 'قبل ساعة واحدة' : '1 hour before',
    };

    useEffect(() => {
    if (editingTask) {
    if (editingTask.id) {
    setFormData({
    title: editingTask.title || '',
    description: editingTask.description || '',
    dueDate: editingTask.dueDate || '',
    dueTime: editingTask.dueTime || '',
    priority: editingTask.priority || 'medium',
    reminderEnabled: editingTask.reminderEnabled ?? false,
    reminderBefore: editingTask.reminderBefore || settings.defaultReminderTime,
    });
    } else {
    setFormData({
    title: '',
    description: '',
    dueDate: editingTask.dueDate || '',
    dueTime: '',
    priority: 'medium',
    reminderEnabled: false,
    reminderBefore: settings.defaultReminderTime,
    });
    }
    }
    }, [editingTask, settings.defaultReminderTime]);

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask?.id) {
    updateTask(editingTask.id, { ...editingTask, ...formData });
    } else {
    addTask(formData);
    }
    closeTaskModal();
    };

    const handleDelete = () => {
    if (editingTask?.id) {
    deleteTask(editingTask.id);
    closeTaskModal();
    }
    };

    if (!taskModalOpen) return null;

    return (
    <div className="mero-modal-overlay" onClick={closeTaskModal}>
    <div className="mero-modal" onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div className="mero-modal-header">
    <h2 className="mero-modal-title">
    {editingTask?.id ? t.editTask : t.newTask}
    </h2>
    <button onClick={closeTaskModal} className="mero-modal-close">
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

    {/* Due Date & Time */}
    <div className="mero-form-row-2">
    <div className="mero-form-group">
    <label>{t.dueDate}</label>
    <input
    type="date"
    value={formData.dueDate}
    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
    className="mero-form-input"
    />
    </div>
    <div className="mero-form-group">
    <label>{t.dueTime}</label>
    <input
    type="time"
    value={formData.dueTime}
    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
    className="mero-form-input"
    />
    </div>
    </div>

    {/* Priority */}
    <div className="mero-form-group">
    <label>{t.priority}</label>
    <div className="mero-priority-options">
    {['low', 'medium', 'high'].map((priority) => (
    <button
    key={priority}
    type="button"
    onClick={() => setFormData({ ...formData, priority })}
    className={`mero-priority-btn ${formData.priority === priority ? `selected ${priority}` : ''}`}
    >
    {t[priority]}
    </button>
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
    {editingTask?.id && (
    <button type="button" onClick={handleDelete} className="mero-delete-btn">
    {t.delete}
    </button>
    )}
    <div className={`mero-action-btns`} style={{ marginLeft: editingTask?.id ? '' : 'auto' }}>
    <button type="button" onClick={closeTaskModal} className="mero-cancel-btn">
    {t.cancel}
    </button>
    <button type="submit" className="mero-submit-btn">
    {editingTask?.id ? t.save : t.add}
    </button>
    </div>
    </div>
    </form>
    </div>
    </div>
    );
}

export default MeroTaskModal;
