import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Save, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { notesStorage } from '../utils/storage';
import './Notes.css';

const Notes = () => {
    const { t } = useLanguage();
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingNote, setEditingNote] = useState(null);
    const [showNewNote, setShowNewNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');

    useEffect(() => {
    loadNotes();
    }, []);

    const loadNotes = async () => {
    const savedNotes = await notesStorage.getAll();
    setNotes(savedNotes);
    };

    const createNote = async () => {
    if (!newNoteTitle.trim()) {
    alert(t('enterTitle'));
    return;
    }

    const note = {
    id: Date.now(),
    title: newNoteTitle,
    content: newNoteContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    await notesStorage.save(updatedNotes);

    setNewNoteTitle('');
    setNewNoteContent('');
    setShowNewNote(false);
    };

    const updateNote = async (noteId, title, content) => {
    const updatedNotes = notes.map((note) =>
    note.id === noteId
    ? { ...note, title, content, updatedAt: new Date().toISOString() }
    : note
    );

    setNotes(updatedNotes);
    await notesStorage.save(updatedNotes);
    setEditingNote(null);
    };

    const deleteNote = async (noteId) => {
    if (!confirm(t('confirm') + '?')) return;

    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    await notesStorage.save(updatedNotes);
    };

    const filteredNotes = notes.filter(
    (note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    });
    };

    return (
    <div className="notes-container fade-in">
    <header className="feature-header">
    <h1 className="text-2xl font-bold">{t('notes')}</h1>
    <p className="text-secondary">{t('notesDescription')}</p>
    </header>

    <div className="notes-toolbar card">
    <div className="search-box">
    <Search size={20} />
    <input
    type="text"
    className="input search-input"
    placeholder={t('searchNotes')}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    />
    </div>

    <button className="btn btn-primary" onClick={() => setShowNewNote(true)}>
    <Plus size={20} />
    {t('newNote')}
    </button>
    </div>

    {showNewNote && (
    <div className="note-editor card">
    <div className="editor-header">
    <h3>{t('newNote')}</h3>
    <button className="btn-icon" onClick={() => setShowNewNote(false)}>
    <X size={20} />
    </button>
    </div>

    <input
    type="text"
    className="input note-title-input"
    placeholder={t('title')}
    value={newNoteTitle}
    onChange={(e) => setNewNoteTitle(e.target.value)}
    />

    <textarea
    className="input note-content-input"
    placeholder={t('content')}
    value={newNoteContent}
    onChange={(e) => setNewNoteContent(e.target.value)}
    rows="6"
    />

    <div className="editor-actions">
    <button className="btn btn-primary" onClick={createNote}>
    <Save size={20} />
    {t('save')}
    </button>
    <button className="btn btn-secondary" onClick={() => setShowNewNote(false)}>
    {t('cancel')}
    </button>
    </div>
    </div>
    )}

    <div className="notes-grid">
    {filteredNotes.length === 0 ? (
    <div className="empty-state card">
    <p className="text-secondary">
    {searchQuery ? t('noResults') : t('noNotes')}
    </p>
    </div>
    ) : (
    filteredNotes.map((note) =>
    editingNote === note.id ? (
    <EditNoteCard
    key={note.id}
    note={note}
    onSave={updateNote}
    onCancel={() => setEditingNote(null)}
    t={t}
    />
    ) : (
    <div key={note.id} className="note-card card">
    <div className="note-header">
    <h3 className="note-title">{note.title}</h3>
    <div className="note-actions">
    <button
    className="btn-icon btn-icon-sm"
    onClick={() => setEditingNote(note.id)}
    >
    <Edit2 size={16} />
    </button>
    <button
    className="btn-icon btn-icon-sm"
    onClick={() => deleteNote(note.id)}
    >
    <Trash2 size={16} />
    </button>
    </div>
    </div>

    <p className="note-content">{note.content}</p>

    <div className="note-meta text-sm text-secondary">
    {t('updatedAt')}: {formatDate(note.updatedAt)}
    </div>
    </div>
    )
    )
    )}
    </div>
    </div>
    );
};

const EditNoteCard = ({ note, onSave, onCancel, t }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    return (
    <div className="note-editor card">
    <input
    type="text"
    className="input note-title-input"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    />

    <textarea
    className="input note-content-input"
    value={content}
    onChange={(e) => setContent(e.target.value)}
    rows="6"
    />

    <div className="editor-actions">
    <button className="btn btn-primary" onClick={() => onSave(note.id, title, content)}>
    <Save size={20} />
    {t('save')}
    </button>
    <button className="btn btn-secondary" onClick={onCancel}>
    {t('cancel')}
    </button>
    </div>
    </div>
    );
};

export default Notes;
