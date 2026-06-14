import React, { useMemo } from 'react';
import useMeroStore from './meroStore';
import { useLanguage } from '../../contexts/LanguageContext';

function MeroTodoList() {
    const { language } = useLanguage();
    const {
    tasks,
    taskFilter,
    setTaskFilter,
    toggleTaskComplete,
    deleteTask,
    openTaskModal,
    selectedDate,
    } = useMeroStore();

    const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    switch (taskFilter) {
    case 'active':
    filtered = filtered.filter(t => !t.completed);
    break;
    case 'completed':
    filtered = filtered.filter(t => t.completed);
    break;
    default:
    break;
    }

    return filtered;
    }, [tasks, taskFilter]);

    const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
    return language === 'ar' ? 'اليوم' : 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
    return language === 'ar' ? 'غداً' : 'Tomorrow';
    }

    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    };

    const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    return { total, completed, pending: total - completed };
    }, [tasks]);

    const t = {
    tasks: language === 'ar' ? 'المهام' : 'Tasks',
    total: language === 'ar' ? 'الكل' : 'Total',
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    done: language === 'ar' ? 'منجز' : 'Done',
    all: language === 'ar' ? 'الكل' : 'All',
    active: language === 'ar' ? 'نشط' : 'Active',
    completed: language === 'ar' ? 'مكتمل' : 'Completed',
    noTasksYet: language === 'ar' ? 'لا توجد مهام بعد' : 'No tasks yet',
    clickToAddTask: language === 'ar' ? 'اضغط على زر + لإضافة مهمة' : 'Click the + button to add a task',
    };

    return (
    <div className="mero-todo-container">
    {/* Header */}
    <div className="mero-todo-header">
    <div className="mero-todo-title-row">
    <h2 className="mero-todo-title">{t.tasks}</h2>
    <button
    onClick={() => openTaskModal({ dueDate: selectedDate })}
    className="mero-add-task-btn"
    title={language === 'ar' ? 'إضافة مهمة' : 'Add Task'}
    >
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    </button>
    </div>

    {/* Stats */}
    <div className="mero-todo-stats">
    <div className="mero-stat-item">
    <div className="mero-stat-dot total"></div>
    <span>{stats.total} {t.total}</span>
    </div>
    <div className="mero-stat-item">
    <div className="mero-stat-dot pending"></div>
    <span>{stats.pending} {t.pending}</span>
    </div>
    <div className="mero-stat-item">
    <div className="mero-stat-dot done"></div>
    <span>{stats.completed} {t.done}</span>
    </div>
    </div>

    {/* Filter Tabs */}
    <div className="mero-filter-tabs">
    {['all', 'active', 'completed'].map((filter) => (
    <button
    key={filter}
    onClick={() => setTaskFilter(filter)}
    className={`mero-filter-tab ${taskFilter === filter ? 'active' : ''}`}
    >
    {t[filter]}
    </button>
    ))}
    </div>
    </div>

    {/* Task List */}
    <div className="mero-task-list">
    {filteredTasks.length === 0 ? (
    <div className="mero-empty-tasks">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
    <p>{t.noTasksYet}</p>
    <span>{t.clickToAddTask}</span>
    </div>
    ) : (
    filteredTasks.map((task) => (
    <div
    key={task.id}
    className={`mero-task-item priority-${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}
    onClick={() => openTaskModal(task)}
    >
    <input
    type="checkbox"
    checked={task.completed}
    onChange={(e) => { e.stopPropagation(); toggleTaskComplete(task.id); }}
    className="mero-task-checkbox"
    />
    <div className="mero-task-content">
    <h3 className="mero-task-title">{task.title}</h3>
    {task.description && (
    <p className="mero-task-description">{task.description}</p>
    )}
    <div className="mero-task-meta">
    {task.dueDate && (
    <span className="mero-task-date">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    {formatDate(task.dueDate)}
    {task.dueTime && ` ${task.dueTime}`}
    </span>
    )}
    <span className={`mero-task-priority ${task.priority || 'medium'}`}>
    {task.priority || 'medium'}
    </span>
    </div>
    </div>
    <button
    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
    className="mero-task-delete"
    title={language === 'ar' ? 'حذف المهمة' : 'Delete task'}
    >
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    </button>
    </div>
    ))
    )}
    </div>
    </div>
    );
}

export default MeroTodoList;
