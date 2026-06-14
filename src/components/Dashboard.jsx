import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BookOpen, Moon, Palette, CalendarDays, Clock, Timer,
  Focus, DollarSign, FileText, Users, Link, Globe,
  Shield, Sun, Bell, Smartphone,
} from 'lucide-react';
import './Dashboard.css';

const features = [
  { id: 'quranTeacher', icon: BookOpen, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'prayerTimes', icon: Moon, gradient: 'linear-gradient(135deg, #17ead9 0%, #6078ea 100%)' },
  { id: 'whiteboard', icon: Palette, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'calendar', icon: CalendarDays, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'worldClock', icon: Clock, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'timer', icon: Timer, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'focusMode', icon: Focus, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'currency', icon: DollarSign, gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'notes', icon: FileText, gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'addressBook', icon: Users, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'quickLinks', icon: Link, gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { id: 'importantSites', icon: Globe, gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
];

const featureRoutes = {
  quranTeacher: '/quran', prayerTimes: '/prayer', whiteboard: '/whiteboard',
  calendar: '/calendar', worldClock: '/world-clock', timer: '/timer',
  focusMode: '/focus', currency: '/currency', notes: '/notes',
  addressBook: '/address-book', quickLinks: '/quick-links', importantSites: '/important-sites',
};

const accentFeatures = [
  { icon: Shield, key: 'rtlSupport' },
  { icon: Smartphone, key: 'secureStorage' },
  { icon: Sun, key: 'darkLightMode' },
  { icon: Bell, key: 'desktopNotifications' },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header slide-up">
        <h1>{t('dashboard')}</h1>
        <p>{t('appTagline')}</p>
      </header>

      <div className="widgets-grid">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="widget"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate(featureRoutes[f.id])}
            >
              <div className="widget-icon" style={{ background: f.gradient }}>
                <Icon size={24} className="text-white" />
              </div>
              <h3>{t(f.id === 'timer' ? 'smartTimer' : f.id === 'currency' ? 'currencyConverter' : f.id)}</h3>
              <p>{t(f.id + 'Desc')}</p>
            </div>
          );
        })}
      </div>

      <div className="greeting-card slide-up" style={{ animationDelay: '200ms' }}>
        <h2>{t('welcomeMessage')}</h2>
        <p>{t('dashboardDesc')}</p>
        <div className="features-grid">
          {accentFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key} className="feature-item">
                <div className="feature-icon">
                  <Icon size={14} />
                </div>
                <span>{t(f.key)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
