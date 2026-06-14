import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ExternalLink, Copy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { quickLinksStorage } from '../utils/storage';
import './QuickLinks.css';

const QuickLinks = () => {
    const { t } = useLanguage();
    const [links, setLinks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', url: '', category: 'zoom' });

    useEffect(() => {
    loadLinks();
    }, []);

    const loadLinks = async () => {
    const saved = await quickLinksStorage.getAll();
    setLinks(saved);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
    const updated = links.map(link =>
    link.id === editingId ? { ...link, ...formData } : link
    );
    setLinks(updated);
    await quickLinksStorage.save(updated);
    } else {
    const newLink = {
    id: Date.now().toString(),
    ...formData,
    createdAt: new Date().toISOString(),
    };
    const updated = [...links, newLink];
    setLinks(updated);
    await quickLinksStorage.save(updated);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', url: '', category: 'zoom', customCategory: '' });
    };

    const deleteLink = async (id) => {
    if (confirm(t('confirmDeleteLink'))) {
    const updated = links.filter(link => link.id !== id);
    setLinks(updated);
    await quickLinksStorage.save(updated);
    }
    };

    const editLink = (link) => {
    setFormData({
    title: link.title,
    url: link.url,
    category: link.category,
    customCategory: link.customCategory || ''
    });
    setEditingId(link.id);
    setShowForm(true);
    };

    const openLink = async (url) => {
    if (window.electron) {
    await window.electron.openExternal(url);
    } else {
    window.open(url, '_blank');
    }
    };

    const copyToClipboard = async (url, title) => {
    try {
    await navigator.clipboard.writeText(url);
    // Show success feedback
    alert(`? ${t('copyLinkSuccess')} " ${title}"`);
    } catch (err) {
    alert(`? ${t('copyLinkFailed')}`);
    }
    };

    const categories = {
    zoom: { name: 'Zoom', icon: '??', color: '#2D8CFF' },
    meet: { name: 'Google Meet', icon: '??', color: '#00897B' },
    teams: { name: 'Teams', icon: '??', color: '#6264A7' },
    other: { name: t('other'), icon: '??', color: '#667eea' },
    };

    const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
    }, {});

    return (
    <div className="quicklinks-container fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('quickLinks')}</h1>
    <p className="text-secondary">{t('quickLinksDescription')}</p>
    </header>

    <button className="btn btn-primary mb-lg" onClick={() => setShowForm(true)}>
    <Plus size={20} />
    {t('addNewLink')}
    </button>

    {/* Form Modal */}
    {showForm && (
    <div className="modal-overlay" onClick={() => setShowForm(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    <h3 className="text-xl font-semibold mb-lg">
    {editingId ? t('editLink') : t('newLink')}
    </h3>
    <form onSubmit={handleSubmit}>
    <div className="form-group">
    <label>{t('title')}</label>
    <input
    type="text"
    className="input"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    placeholder={t('titlePlaceholder')}
    required
    />
    </div>
    <div className="form-group">
    <label>{t('url')}</label>
    <input
    type="text"
    className="input"
    value={formData.url}
    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
    onKeyDown={(e) => e.stopPropagation()}
    placeholder="https://zoom.us/j/..."
    required
    />
    </div>
    <div className="form-group">
    <label>{t('type')}</label>
    <select
    className="input"
    value={formData.category}
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
    >
    {Object.entries(categories).map(([key, cat]) => (
    <option key={key} value={key}>
    {cat.icon} {cat.name}
    </option>
    ))}
    </select>
    </div>
    {formData.category === 'other' && (
    <div className="form-group">
    <label>{t('customTypeName')}</label>
    <input
    type="text"
    className="input"
    value={formData.customCategory || ''}
    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
    placeholder={t('customTypePlaceholder')}
    />
    </div>
    )}
    <div className="form-actions">
    <button type="submit" className="btn btn-primary">
    {editingId ? t('update') : t('save')}
    </button>
    <button
    type="button"
    className="btn btn-secondary"
    onClick={() => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', url: '', category: 'zoom', customCategory: '' });
    }}
    >
    {t('cancel')}
    </button>
    </div>
    </form>
    </div>
    </div>
    )}

    {/* Links by Category */}
    {Object.keys(groupedLinks).length === 0 ? (
    <div className="empty-state card">
    <p>{t('noLinksYet')}</p>
    </div>
    ) : (
    Object.entries(groupedLinks).map(([category, categoryLinks]) => (
    <div key={category} className="category-section">
    <h3 className="category-title" style={{ color: categories[category]?.color || '#667eea' }}>
    {categories[category]?.icon || '??'} {
    category === 'other' && categoryLinks[0]?.customCategory
    ? categoryLinks[0].customCategory
    : (categories[category]?.name || category)
    }
    </h3>
    <div className="links-grid">
    {categoryLinks.map((link) => (
    <div key={link.id} className="link-card card">
    <div className="link-header">
    <h4 className="link-title">{link.title}</h4>
    <div className="link-actions">
    <button className="icon-btn" onClick={() => editLink(link)} title={t('editLink')}>
    <Edit size={16} />
    </button>
    <button className="icon-btn delete" onClick={() => deleteLink(link.id)} title={t('delete')}>
    <Trash2 size={16} />
    </button>
    </div>
    </div>
    <button className="open-link-btn" onClick={() => openLink(link.url)}>
    <ExternalLink size={18} />
    {t('openLink')}
    </button>
    <button className="copy-link-btn" onClick={() => copyToClipboard(link.url, link.title)} title={t('copyLinkTooltip')}>
    <Copy size={16} />
    {t('copy')}
    </button>
    </div>
    ))}
    </div>
    </div>
    ))
    )}
    </div>
    );
};

export default QuickLinks;
