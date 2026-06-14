import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Shell from '@/shared/layout/Shell';

const Dashboard = lazy(() => import('@/components/Dashboard'));
const QuranTeacher = lazy(() => import('@/features/QuranTeacher'));
const PrayerTimes = lazy(() => import('@/features/PrayerTimes'));
const Whiteboard = lazy(() => import('@/features/Whiteboard'));
const Calendar = lazy(() => import('@/features/MeroCalendar'));
const WorldClock = lazy(() => import('@/features/WorldClock'));
const TimerFeat = lazy(() => import('@/features/Timer'));
const FocusMode = lazy(() => import('@/features/FocusMode'));
const Currency = lazy(() => import('@/features/CurrencyConverter'));
const Notes = lazy(() => import('@/features/Notes'));
const AddressBook = lazy(() => import('@/features/AddressBook'));
const QuickLinks = lazy(() => import('@/features/QuickLinks'));
const ImportantSites = lazy(() => import('@/features/ImportantSites'));
const Settings = lazy(() => import('@/features/Settings'));

const features = [
  { path: 'dashboard', Component: Dashboard },
  { path: 'quran', Component: QuranTeacher },
  { path: 'prayer', Component: PrayerTimes },
  { path: 'whiteboard', Component: Whiteboard },
  { path: 'calendar', Component: Calendar },
  { path: 'world-clock', Component: WorldClock },
  { path: 'timer', Component: TimerFeat },
  { path: 'focus', Component: FocusMode },
  { path: 'currency', Component: Currency },
  { path: 'notes', Component: Notes },
  { path: 'address-book', Component: AddressBook },
  { path: 'quick-links', Component: QuickLinks },
  { path: 'important-sites', Component: ImportantSites },
  { path: 'settings', Component: Settings },
];

const featureRoute = ({ path, Component }) => ({
  path,
  element: (
    <div className="h-full overflow-y-auto p-4 md:p-6 fade-in">
      <Component />
    </div>
  ),
});

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...features.map(featureRoute),
    ],
  },
]);
