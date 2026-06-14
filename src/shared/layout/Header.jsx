import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard, BookOpen, Moon, Palette, CalendarDays, Clock,
  Timer, Focus, DollarSign, FileText, Users, Link as LinkIcon, Globe, Settings,
  Sun, Languages, Grid, ChevronDown, Home, ArrowLeft, ArrowRight
} from 'lucide-react';
import './Header.css';

const tools = [
  { to: '/quran', icon: BookOpen, titleKey: 'quranTeacher', descKey: 'quranDesc', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { to: '/prayer', icon: Moon, titleKey: 'prayerTimes', descKey: 'prayerTimesDesc', gradient: 'linear-gradient(135deg, #17ead9 0%, #6078ea 100%)' },
  { to: '/whiteboard', icon: Palette, titleKey: 'whiteboard', descKey: 'whiteboardDesc', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { to: '/calendar', icon: CalendarDays, titleKey: 'calendar', descKey: 'calendarDesc', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { to: '/world-clock', icon: Clock, titleKey: 'worldClock', descKey: 'worldClockDesc', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { to: '/timer', icon: Timer, titleKey: 'timer', descKey: 'timerDesc', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { to: '/focus', icon: Focus, titleKey: 'focusMode', descKey: 'focusModeDesc', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { to: '/currency', icon: DollarSign, titleKey: 'currencyConverter', descKey: 'currencyConverterDesc', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { to: '/notes', icon: FileText, titleKey: 'notes', descKey: 'notesDesc', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { to: '/address-book', icon: Users, titleKey: 'addressBook', descKey: 'addressBookDesc', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { to: '/quick-links', icon: LinkIcon, titleKey: 'quickLinks', descKey: 'quickLinksDesc', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { to: '/important-sites', icon: Globe, titleKey: 'importantSites', descKey: 'importantSitesDesc', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
];

export default function Header() {
  const { t, language, changeLanguage } = useLanguage();
  const { theme, changeTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const currentPath = location.pathname;
  const isDashboard = currentPath === '/dashboard' || currentPath === '/';
  const currentTool = tools.find((t) => t.to === currentPath);
  const isSettings = currentPath === '/settings';

  const getBreadcrumbLabel = () => {
    if (isDashboard) return '';
    if (isSettings) return t('settings');
    if (currentTool) return t(currentTool.titleKey);
    return '';
  };

  const activeLabel = getBreadcrumbLabel();

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left Section: Logo, Branding, and Breadcrumbs */}
        <div className="header-left">
          <Link to="/dashboard" className="header-branding">
            <div className="header-logo-box">ن</div>
            <div className="header-title-wrapper">
              <span className="header-title">{t('appName')}</span>
              <span className="header-tagline">{t('appTagline')}</span>
            </div>
          </Link>

          {!isDashboard && activeLabel && (
            <div className="header-breadcrumbs">
              <span className="breadcrumb-separator">/</span>
              <button onClick={() => navigate('/dashboard')} className="breadcrumb-home-link" title={t('dashboard')}>
                {t('dashboard')}
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">{activeLabel}</span>
            </div>
          )}
        </div>

        {/* Right Section: Navigation and Controls */}
        <div className="header-right">
          {/* Navigation Links */}
          <nav className="header-nav">
            <Link
              to="/dashboard"
              className={`nav-link ${isDashboard ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </Link>

            {/* Tools Dropdown Trigger */}
            <div className="dropdown-wrapper" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`nav-link dropdown-trigger ${dropdownOpen ? 'active' : ''} ${currentTool ? 'active-tool' : ''}`}
              >
                <Grid size={18} />
                <span>{t('tools')}</span>
                <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools Dropdown Menu */}
              {dropdownOpen && (
                <div className="tools-dropdown-menu slide-up">
                  <div className="dropdown-header">
                    <h3>{t('tools')}</h3>
                  </div>
                  <div className="tools-grid">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      const isActiveTool = currentPath === tool.to;
                      return (
                        <Link
                          key={tool.to}
                          to={tool.to}
                          className={`tools-grid-item ${isActiveTool ? 'active' : ''}`}
                        >
                          <div className="tool-icon-wrapper" style={{ background: tool.gradient }}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="tool-info">
                            <span className="tool-title">{t(tool.titleKey)}</span>
                            <span className="tool-desc">{t(tool.descKey)}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Vertical divider */}
          <span className="header-divider" />

          {/* Quick Controls */}
          <div className="header-controls">
            {/* Back to Home Button (conditionally rendered when on tool page) */}
            {!isDashboard && (
              <button
                onClick={() => navigate('/dashboard')}
                className="control-btn back-btn"
                title={t('dashboard')}
              >
                {language === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                <span className="back-btn-text">{t('dashboard')}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
              className="control-btn"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              <Languages size={18} />
              <span className="control-label">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
              className="control-btn"
              title={theme === 'dark' ? t('light') : t('dark')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Settings Link */}
            <Link
              to="/settings"
              className={`control-btn ${isSettings ? 'active' : ''}`}
              title={t('settings')}
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
