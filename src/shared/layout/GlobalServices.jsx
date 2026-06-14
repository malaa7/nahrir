import { lazy, Suspense } from 'react';

const MeroReminderService = lazy(() => import('@/features/MeroCalendar/MeroReminderService'));
const MeroAlarmOverlay = lazy(() => import('@/features/MeroCalendar/MeroAlarmOverlay'));
const PrayerTimesService = lazy(() => import('@/features/PrayerTimes/PrayerTimesService'));
const TimerService = lazy(() => import('@/features/TimerService'));
const FocusService = lazy(() => import('@/features/FocusService'));
const QuranService = lazy(() => import('@/features/QuranService'));

export default function GlobalServices() {
  return (
    <Suspense fallback={null}>
    <MeroReminderService />
    <MeroAlarmOverlay />
    <PrayerTimesService />
    <TimerService />
    <FocusService />
    <QuranService />
    </Suspense>
  );
}
