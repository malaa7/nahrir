import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { sitesData } from './sitesData';
import './ImportantSites.css';

const ImportantSites = () => {
    const { t, language } = useLanguage();

    const handleVisit = (url) => {
    if (window.electron && window.electron.openExternal) {
    window.electron.openExternal(url);
    } else {
    window.open(url, '_blank');
    }
    };

    return (
    <div className="important-sites-container fade-in">
    <header className="sites-header">
    <h1>{t('importantSites')}</h1>
    <p>{t('importantSitesDesc')}</p>
    </header>

    <div className="sites-grid">
    {sitesData.map((site) => {
    const Icon = site.icon || Globe;
    const siteName = language === 'ar' ? site.name : (site.nameEn || site.name);

    return (
    <div key={site.id} className="site-card">
    <div className="site-card-header">
    <div className="site-icon-wrapper" style={{ color: site.color }}>
    <Icon size={32} />
    </div>
    <h3>{siteName}</h3>
    </div>
    <div className="site-card-body">
    <button
    className="visit-btn"
    onClick={() => handleVisit(site.url)}
    >
    <span>{t('visitSite')}</span>
    <ExternalLink size={16} className="external-icon" />
    </button>
    </div>
    </div>
    );
    })}
    </div>
    </div>
    );
};

export default ImportantSites;
