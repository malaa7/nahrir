import React, { useState, useRef } from 'react';
import {
    Search,
    Plus,
    Upload,
    Download,
    Trash2,
    Edit2,
    Users,
    X,
    FolderPlus,
    AlertTriangle
} from 'lucide-react';
import { read, utils, writeFile, write } from 'xlsx';
import useAddressStore from './store';
import { useLanguage } from '../../contexts/LanguageContext';
import './AddressBook.css';

const AddressBook = () => {
    const { t, isRTL } = useLanguage();
    const {
    contacts,
    lists,
    currentListId,
    searchQuery,
    setSearchQuery,
    setCurrentListId,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
    addList,
    deleteList,
    clearAllContacts
    } = useAddressStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [newListName, setNewListName] = useState('');
    const [pendingImportData, setPendingImportData] = useState(null);
    const fileInputRef = useRef(null);

    // Filter Contacts
    const filteredContacts = contacts.filter(contact => {
    const matchesList = currentListId === 'all' || contact.listId === currentListId;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
    (contact.name?.toLowerCase() || '').includes(query) ||
    (contact.phone?.toLowerCase() || '').includes(query) ||
    (contact.email?.toLowerCase() || '').includes(query) ||
    (contact.job?.toLowerCase() || '').includes(query);

    return matchesList && matchesSearch;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Handlers
    const handleAddList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
    addList(newListName, '#64748b'); // Default color
    setNewListName('');
    }
    };

    const handleExport = async () => {
    // Prepare data for export
    const dataToExport = filteredContacts.map(c => ({
    [t('contactName')]: c.name,
    [t('contactPhone')]: c.phone,
    [t('contactEmail')]: c.email,
    [t('contactJob')]: c.job,
    [t('contactAddress')]: c.address,
    [t('contactList')]: lists.find(l => l.id === c.listId)?.name || t('all')
    }));

    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Contacts");

    // Generate filename
    const listName = lists.find(l => l.id === currentListId)?.name || 'Contacts';
    const fileName = `${listName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    if (window.electron && window.electron.saveFile) {
    // Write to base64 and send to Electron
    const base64Content = write(wb, { type: 'base64', bookType: 'xlsx' });
    const base64Data = 'base64:' + base64Content;
    const result = await window.electron.saveFile({
    data: base64Data,
    defaultName: fileName,
    filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
    });
    if (result.success) {
    console.log('File saved to:', result.path);
    }
    } else {
    // Browser fallback
    writeFile(wb, fileName);
    }
    };

    const handleClearAll = () => {
    if (confirm(t('confirmClearAllContacts'))) {
    clearAllContacts();
    }
    };

    const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = read(bstr, { type: 'binary' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = utils.sheet_to_json(ws);

    // Normalize keys and map
    const mappedContacts = data.map(row => {
    // Helper to find value with flexible key matching
    const getValue = (targetKeys) => {
    const normalizedHeaders = Object.keys(row).reduce((acc, key) => {
    // Normalize: trim, lowercase, remove special chars
    const cleanKey = key.toString().trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    acc[cleanKey] = row[key];
    return acc;
    }, {});

    for (const key of targetKeys) {
    const cleanTarget = key.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    if (normalizedHeaders[cleanTarget] !== undefined) {
    return normalizedHeaders[cleanTarget];
    }
    }
    return '';
    };

    return {
    name: getValue(['name', 'اسم', 'الاسم', 'full name']),
    phone: getValue(['phone', 'mobile', 'هاتف', 'جوال', 'رقم', 'رقم الهاتف', 'الهاتف', 'الجوال', 'المحمول', 'tel', 'telephone']),
    email: getValue(['email', 'mail', 'e-mail', 'بريد', 'البريد', 'البريد الإلكتروني', 'E-Mail Address']),
    job: getValue(['job', 'role', 'position', 'وظيفة', 'المهنة', 'الوظيفة', 'title', 'المسمى الوظيفي', 'الرتبة', 'العمل']),
    address: getValue(['address', 'location', 'عنوان', 'العنوان', 'السكن']),
    listId: currentListId === 'all' ? 'all' : currentListId
    };
    }).filter(c => c.name);

    if (mappedContacts.length > 0) {
    setPendingImportData(mappedContacts);
    setIsImportModalOpen(true); // Open confirmation modal
    } else {
    alert(t('noContacts'));
    }
    e.target.value = null; // Reset input
    };
    reader.readAsBinaryString(file);
    };

    const confirmImport = (mode) => {
    if (pendingImportData) {
    importContacts(pendingImportData, mode);
    setIsImportModalOpen(false);
    setPendingImportData(null);
    }
    };

    const handleSaveContact = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    job: formData.get('job'),
    address: formData.get('address'),
    listId: formData.get('listId'),
    };

    if (editingContact) {
    updateContact(editingContact.id, data);
    } else {
    addContact(data);
    }
    setIsModalOpen(false);
    setEditingContact(null);
    };

    const getListName = (list) => {
    if (list.id === 'all') return t('all');
    if (list.id === 'students') return t('students') || list.name; // Fallback
    if (list.id === 'teachers') return t('teachers') || list.name; // Fallback
    if (list.id === 'other') return t('other');
    return list.name;
    };

    return (
    <div className="address-book-container" dir={isRTL ? 'rtl' : 'ltr'}>
    {/* Sidebar */}
    <div className="ab-sidebar">
    <div className="ab-sidebar-header">
    <h2>{t('addressBook')}</h2>
    </div>

    <form className="ab-add-list-form" onSubmit={handleAddList}>
    <input
    type="text"
    placeholder={t('newListPlaceholder')}
    className="ab-add-list-input"
    value={newListName}
    onChange={(e) => setNewListName(e.target.value)}
    />
    <button type="submit" className="ab-add-list-btn" title="Create list">
    <FolderPlus size={16} />
    </button>
    </form>

    <div className="ab-nav-list">
    {lists.map(list => (
    <div
    key={list.id}
    className={`ab-nav-item ${currentListId === list.id ? 'active' : ''}`}
    onClick={() => setCurrentListId(list.id)}
    >
    <div className="ab-list-info">
    <span className="ab-list-color" style={{ background: list.color }}></span>
    <span>{getListName(list)}</span>
    </div>
    {!list.isDefault && (
    <button
    className="ab-delete-list-btn"
    onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
    title={t('delete')}
    >
    <Trash2 size={14} />
    </button>
    )}
    </div>
    ))}
    </div>
    </div>

    {/* Main Content */}
    <div className="ab-main">
    <div className="ab-header">
    <div className="ab-header-top">
    <div className="ab-header-title">
    <h1>{lists.find(l => l.id === currentListId) ? getListName(lists.find(l => l.id === currentListId)) : ''}</h1>
    <span>{filteredContacts.length} {t('contactsCount')}</span>
    </div>
    <div className="ab-actions">
    <input
    type="file"
    ref={fileInputRef}
    style={{ display: 'none' }}
    accept=".xlsx, .xls, .csv"
    onChange={handleFileSelect}
    />
    <button className="ab-btn" onClick={() => fileInputRef.current?.click()}>
    <Upload size={18} />
    <span>{t('importContacts')}</span>
    </button>
    <button className="ab-btn" onClick={handleExport}>
    <Download size={18} />
    <span>{t('exportContacts')}</span>
    </button>
    <button className="ab-btn danger" onClick={handleClearAll} disabled={contacts.length === 0}>
    <Trash2 size={18} />
    <span>{t('clearAllContacts')}</span>
    </button>
    <button className="ab-btn ab-btn-primary" onClick={() => { setEditingContact(null); setIsModalOpen(true); }}>
    <Plus size={18} />
    <span>{t('addContact')}</span>
    </button>
    </div>
    </div>

    <div className="ab-search-bar">
    <input
    type="text"
    className="ab-search-input"
    placeholder={t('searchPlaceholder')}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    />
    <Search className="ab-search-icon" size={20} style={{ right: isRTL ? 'auto' : '0.75rem', left: isRTL ? '0.75rem' : 'auto' }} />
    </div>
    </div>

    <div className="ab-content">
    {filteredContacts.length > 0 ? (
    <div className="ab-table-container">
    <table className="ab-table">
    <thead>
    <tr>
    <th style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('contactName')}</th>
    <th style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('contactPhone')}</th>
    <th style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('contactEmail')}</th>
    <th style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('contactJob')}</th>
    <th style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('contactAddress')}</th>
    <th></th>
    </tr>
    </thead>
    <tbody>
    {filteredContacts.map(contact => (
    <tr key={contact.id}>
    <td style={{ fontWeight: 600 }}>{contact.name}</td>
    <td style={{ direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{contact.phone}</td>
    <td>{contact.email}</td>
    <td>{contact.job}</td>
    <td>{contact.address}</td>
    <td>
    <div className="ab-contact-actions">
    <button
    className="ab-action-btn"
    onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}
    title={t('edit')}
    >
    <Edit2 size={16} />
    </button>
    <button
    className="ab-action-btn delete"
    onClick={() => deleteContact(contact.id)}
    title={t('delete')}
    >
    <Trash2 size={16} />
    </button>
    </div>
    </td>
    </tr>
    ))}
    </tbody>
    </table>
    </div>
    ) : (
    <div className="empty-state">
    <Users size={64} className="empty-state-icon" />
    <h3>{t('noContacts')}</h3>
    <p>{t('noContactsDesc')}</p>
    </div>
    )}
    </div>
    </div>

    {/* Edit/Add Modal */}
    {isModalOpen && (
    <div className="ab-modal-overlay" onClick={() => setIsModalOpen(false)}>
    <div className="ab-modal" onClick={e => e.stopPropagation()}>
    <div className="ab-modal-header">
    <h3>{editingContact ? t('editContact') : t('newContact')}</h3>
    <button className="ab-modal-close" onClick={() => setIsModalOpen(false)}>
    <X size={20} />
    </button>
    </div>
    <form onSubmit={handleSaveContact}>
    <div className="ab-modal-body">
    <div className="ab-form-group">
    <label>{t('contactName')}</label>
    <input name="name" required className="ab-form-input" defaultValue={editingContact?.name} autoFocus />
    </div>
    <div className="ab-form-group">
    <label>{t('contactPhone')}</label>
    <input name="phone" className="ab-form-input" defaultValue={editingContact?.phone} />
    </div>
    <div className="ab-form-group">
    <label>{t('contactEmail')}</label>
    <input name="email" type="email" className="ab-form-input" defaultValue={editingContact?.email} />
    </div>
    <div className="ab-form-group">
    <label>{t('contactJob')}</label>
    <input name="job" className="ab-form-input" defaultValue={editingContact?.job} />
    </div>
    <div className="ab-form-group">
    <label>{t('contactAddress')}</label>
    <input name="address" className="ab-form-input" defaultValue={editingContact?.address} />
    </div>
    <div className="ab-form-group">
    <label>{t('contactList')}</label>
    <select name="listId" className="ab-form-select" defaultValue={editingContact?.listId || currentListId}>
    {lists.map(l => (
    <option key={l.id} value={l.id}>{getListName(l)}</option>
    ))}
    </select>
    </div>
    </div>
    <div className="ab-modal-footer">
    <button type="button" className="ab-btn" onClick={() => setIsModalOpen(false)}>
    {t('cancel')}
    </button>
    <button type="submit" className="ab-btn ab-btn-primary">
    {t('save')}
    </button>
    </div>
    </form>
    </div>
    </div>
    )}

    {/* Import Confirmation Modal */}
    {isImportModalOpen && (
    <div className="ab-modal-overlay" onClick={() => setIsImportModalOpen(false)}>
    <div className="ab-modal" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
    <div className="ab-modal-header">
    <h3>{t('importTitle')}</h3>
    <button className="ab-modal-close" onClick={() => setIsImportModalOpen(false)}>
    <X size={20} />
    </button>
    </div>
    <div className="ab-modal-body">
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#f59e0b' }}>
    <AlertTriangle size={32} />
    <p style={{ margin: 0, color: 'var(--text-primary)' }}>
    {t('importMessage')}
    </p>
    </div>
    </div>
    <div className="ab-modal-footer" style={{ flexDirection: 'column', gap: '0.5rem' }}>
    <button
    className="ab-btn ab-btn-primary"
    style={{ width: '100%', justifyContent: 'center' }}
    onClick={() => confirmImport('append')}
    >
    {t('importAppend')}
    </button>
    <button
    className="ab-btn"
    style={{ width: '100%', justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}
    onClick={() => confirmImport('replace')}
    >
    {t('importReplace')}
    </button>
    </div>
    </div>
    </div>
    )}
    </div>
    );
};

export default AddressBook;
