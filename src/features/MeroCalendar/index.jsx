import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import MeroCalendarView from './MeroCalendarView';
import MeroTodoList from './MeroTodoList';
import MeroEventModal from './MeroEventModal';
import MeroTaskModal from './MeroTaskModal';
import './MeroCalendar.css';

function MeroCalendar() {
    const { t } = useLanguage();

    return (
    <div className="mero-calendar-container fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('calendar')}</h1>
    <p className="text-secondary">{t('calendarDescription')}</p>
    </header>

    <div className="mero-calendar-layout">
    <MeroCalendarView />
    <MeroTodoList />
    </div>

    {/* Modals */}
    <MeroEventModal />
    <MeroTaskModal />
    </div>
    );
}

export default MeroCalendar;
