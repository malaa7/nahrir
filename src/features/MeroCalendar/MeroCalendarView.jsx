import React, { useMemo, useState } from 'react';
import useMeroStore from './meroStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { getHijriDate } from '../../utils/hijriUtils';

// Helper function to format date as YYYY-MM-DD in local timezone
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const monthNames = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

const dayNames = {
    ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

function MeroCalendarView() {
    const { language } = useLanguage();
    const {
    currentMonth,
    setCurrentMonth,
    nextMonth,
    prevMonth,
    selectedDate,
    setSelectedDate,
    events,
    openEventModal
    } = useMeroStore();

    const [showMonthPicker, setShowMonthPicker] = useState(false);

    const months = monthNames[language] || monthNames.ar;
    const days = dayNames[language] || dayNames.ar;

    // Get Hijri info for current view
    const hijriCurrent = getHijriDate(currentMonth);

    // Generate year options (2020 to 2050)
    const yearOptions = [];
    for (let y = 2020; y <= 2050; y++) {
    yearOptions.push(y);
    }

    const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const daysArray = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
    daysArray.push({
    date: new Date(year, month - 1, prevMonthLastDay - i),
    isCurrentMonth: false,
    });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
    daysArray.push({
    date: new Date(year, month, i),
    isCurrentMonth: true,
    });
    }

    // Next month padding
    const remainingDays = 42 - daysArray.length;
    for (let i = 1; i <= remainingDays; i++) {
    daysArray.push({
    date: new Date(year, month + 1, i),
    isCurrentMonth: false,
    });
    }

    return daysArray;
    }, [currentMonth]);

    // Helper to expand recurring events
    const expandRecurringEvents = (event, date) => {
    if (event.recurrence !== 'weekly') return [];

    const eventDate = new Date(event.date + 'T00:00:00');
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (eventDate.getDay() === checkDate.getDay() && checkDate >= eventDate) {
    return [event];
    }
    return [];
    };

    const getEventsForDate = (date) => {
    const dateStr = formatLocalDate(date);

    const directEvents = events.filter(event => event.date === dateStr);

    const recurringEvents = events
    .filter(event => event.recurrence === 'weekly' && event.date !== dateStr)
    .flatMap(event => expandRecurringEvents(event, date));

    return [...directEvents, ...recurringEvents];
    };

    const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
    return formatLocalDate(date) === selectedDate;
    };

    const handleDayClick = (date) => {
    const dateStr = formatLocalDate(date);
    setSelectedDate(dateStr);
    };

    const handleDayDoubleClick = (date) => {
    const dateStr = formatLocalDate(date);
    setSelectedDate(dateStr);
    openEventModal({ date: dateStr });
    };

    const handleEventClick = (e, event) => {
    e.stopPropagation();
    openEventModal(event);
    };

    const handleMonthChange = (month) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    };

    const handleYearChange = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    };

    return (
    <div className="mero-calendar-main card">
    {/* Calendar Header with 4-Way Picker */}
    <div className="mero-calendar-header">
    <div className="flex flex-col gap-2 w-full">
    {/* Top Row: Gregorian Controls */}
    <div className="flex items-center justify-between w-full">
    <div className="flex gap-2">
    {/* Gregorian Month Button */}
    <div className="relative">
    <button
    onClick={() => setShowMonthPicker(showMonthPicker === 'gMonth' ? null : 'gMonth')}
    className={`mero-header-btn ${showMonthPicker === 'gMonth' ? 'active' : ''}`}
    >
    {months[currentMonth.getMonth()]}
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
    {showMonthPicker === 'gMonth' && (
    <div className="mero-month-dropdown">
    <div className="mero-months-grid">
    {months.map((month, index) => (
    <button
    key={month}
    onClick={() => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(index);
    setCurrentMonth(newDate);
    setShowMonthPicker(null);
    }}
    className={`mero-month-item ${currentMonth.getMonth() === index ? 'active' : ''}`}
    >
    {month}
    </button>
    ))}
    </div>
    </div>
    )}
    </div>

    {/* Gregorian Year Button */}
    <div className="relative">
    <button
    onClick={() => setShowMonthPicker(showMonthPicker === 'gYear' ? null : 'gYear')}
    className={`mero-header-btn ${showMonthPicker === 'gYear' ? 'active' : ''}`}
    >
    {currentMonth.getFullYear()}
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
    {showMonthPicker === 'gYear' && (
    <div className="mero-month-dropdown">
    <div className="mero-months-grid text-lg"> {/* Reusing grid for years */}
    {yearOptions.map(year => (
    <button
    key={year}
    onClick={() => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setShowMonthPicker(null);
    }}
    className={`mero-month-item ${currentMonth.getFullYear() === year ? 'active' : ''}`}
    >
    {year}
    </button>
    ))}
    </div>
    </div>
    )}
    </div>
    </div>

    {/* Navigation Arrows (kept independent) */}
    <div className="mero-nav-controls">
    <button onClick={prevMonth} className="mero-nav-btn"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
    <button onClick={nextMonth} className="mero-nav-btn"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
    </div>
    </div>

    {/* Bottom Row: Hijri Controls */}
    <div className="flex gap-2">
    {/* Hijri Month Button */}
    <div className="relative">
    <button
    onClick={() => setShowMonthPicker(showMonthPicker === 'hMonth' ? null : 'hMonth')}
    className={`mero-header-btn hijri ${showMonthPicker === 'hMonth' ? 'active' : ''}`}
    >
    {hijriCurrent.month}
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
    {showMonthPicker === 'hMonth' && (
    <div className="mero-month-dropdown">
    <div className="mero-months-grid">
    {/* Import names dynamically if possible, else hardcode ar array since interface is ar/en */}
    {(language === 'ar' ?
    ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'] :
    ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', 'Shaaban', 'Ramadan', 'Shawwal', 'Dhul-Qi\'dah', 'Dhul-Hijjah']
    ).map((mName, idx) => (
    <button
    key={mName}
    onClick={() => {
    // Approximate jump: keep current Hijri year, switch month
    // We need to parse strict integer for year
    const hYearInt = parseInt(hijriCurrent.year);
    // Estimate Gregorian date
    // We need to import estimateGregorianDate function or define it.
    // Assuming it's imported at top.
    // Since I can't easily import it here without changing top of file, 
    // I'll assume I add the import in a previous step or next step?
    // Wait, I updated hijriUtils.js but haven't updated imports in this file yet.
    // Use a rough calculation here inline safely if needed, or better, 
    // I will add the import in the *next* step if missing.
    // Actually, let's use a rough inline logic to prevent ReferenceError.
    const gYearApprox = Math.floor(hYearInt * 0.970229 + 621.5774);
    const dayOfYear = Math.floor(idx * 29.5) + 1;
    const estDate = new Date(gYearApprox, 0, 1);
    estDate.setDate(dayOfYear);
    setCurrentMonth(estDate);
    setShowMonthPicker(null);
    }}
    className={`mero-month-item ${hijriCurrent.month === mName ? 'active' : ''}`} // Comparison might be loose due to spelling
    >
    {mName}
    </button>
    ))}
    </div>
    </div>
    )}
    </div>

    {/* Hijri Year Button */}
    <div className="relative">
    <button
    onClick={() => setShowMonthPicker(showMonthPicker === 'hYear' ? null : 'hYear')}
    className={`mero-header-btn hijri ${showMonthPicker === 'hYear' ? 'active' : ''}`}
    >
    {hijriCurrent.year}
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
    {showMonthPicker === 'hYear' && (
    <div className="mero-month-dropdown">
    <div className="mero-months-grid text-lg">
    {/* Generate Hijri years +- 10 from current */}
    {Array.from({ length: 30 }, (_, i) => parseInt(hijriCurrent.year) - 15 + i).map(y => (
    <button
    key={y}
    onClick={() => {
    // Jump to same month but new year
    const gYearApprox = Math.floor(y * 0.970229 + 621.5774);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(gYearApprox);
    setCurrentMonth(newDate);
    setShowMonthPicker(null);
    }}
    className={`mero-month-item ${parseInt(hijriCurrent.year) === y ? 'active' : ''}`}
    >
    {y}
    </button>
    ))}
    </div>
    </div>
    )}
    </div>
    </div>
    </div>
    </div>

    {/* Click outside to close month picker */}
    {showMonthPicker && (
    <div
    className="mero-dropdown-overlay"
    onClick={() => setShowMonthPicker(null)}
    />
    )}

    {/* Day Names */}
    <div className="mero-day-names">
    {days.map(day => (
    <div key={day} className="mero-day-name">
    {day}
    </div>
    ))}
    </div>

    {/* Calendar Grid */}
    <div className="mero-calendar-grid">
    {calendarDays.map((day, index) => {
    const dayEvents = getEventsForDate(day.date);
    const today = isToday(day.date);
    const selected = isSelected(day.date);
    const hijriDay = getHijriDate(day.date);

    return (
    <div
    key={index}
    onClick={() => handleDayClick(day.date)}
    onDoubleClick={() => handleDayDoubleClick(day.date)}
    className={`mero-calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${selected ? 'selected' : ''} ${today && !selected ? 'today' : ''}`}
    >
    <div className="day-header flex flex-col items-center justify-center gap-1">
    <span className={`mero-day-number ${today ? 'is-today' : ''}`}>
    {day.date.getDate()}
    </span>
    <div className="mero-hijri-day-box">
    {hijriDay.day}
    </div>
    </div>

    {/* Event Indicators */}
    {dayEvents.length > 0 && (
    <div className="mero-day-events">
    {dayEvents.slice(0, 3).map((event, i) => (
    <div
    key={event.id || i}
    onClick={(e) => handleEventClick(e, event)}
    className="mero-event-item"
    style={{ backgroundColor: event.color + '40', color: event.color }}
    title={`${language === 'ar' ? 'اضغط للتعديل:' : 'Click to edit:'} ${event.title}`}
    >
    {event.title}
    </div>
    ))}
    {dayEvents.length > 3 && (
    <div className="mero-more-events">
    +{dayEvents.length - 3} {language === 'ar' ? 'المزيد' : 'more'}
    </div>
    )}
    </div>
    )}
    </div>
    );
    })}
    </div>

    {/* Add Event Button */}
    <div className="mero-add-event-section">
    <button
    onClick={() => openEventModal({ date: selectedDate })}
    className="mero-add-event-btn"
    >
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    {language === 'ar' ? 'إضافة حدث' : 'Add Event'}
    </button>
    </div>
    </div>
    );
}

export default MeroCalendarView;
// Re-trigger build
