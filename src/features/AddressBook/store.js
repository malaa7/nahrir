import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useAddressStore = create(
    persist(
    (set, get) => ({
    contacts: [],
    lists: [
    { id: 'all', name: 'الكل', color: '#3b82f6', isDefault: true },
    { id: 'students', name: 'الطلاب', color: '#10b981' },
    { id: 'teachers', name: 'المعلمين', color: '#f59e0b' },
    { id: 'other', name: 'أخرى', color: '#94a3b8' }
    ],
    currentListId: 'all',
    searchQuery: '',

    // Actions
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCurrentListId: (id) => set({ currentListId: id }),

    // Contact Actions
    addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, { ...contact, id: uuidv4(), createdAt: new Date().toISOString() }]
    })),

    updateContact: (id, updatedContact) => set((state) => ({
    contacts: state.contacts.map(c => c.id === id ? { ...c, ...updatedContact } : c)
    })),

    deleteContact: (id) => set((state) => ({
    contacts: state.contacts.filter(c => c.id !== id)
    })),

    importContacts: (newContacts, mode = 'append') => set((state) => {
    // Assign UUIDs if missing
    const processed = newContacts.map(c => ({
    ...c,
    id: c.id || uuidv4(),
    createdAt: c.createdAt || new Date().toISOString(),
    listId: c.listId || 'all'
    }));

    if (mode === 'replace') {
    return { contacts: processed };
    }

    return { contacts: [...state.contacts, ...processed] };
    }),

    // List Actions
    addList: (name, color) => set((state) => ({
    lists: [...state.lists, { id: uuidv4(), name, color }]
    })),

    deleteList: (id) => set((state) => ({
    lists: state.lists.filter(l => l.id !== id || l.isDefault),
    contacts: state.contacts.map(c => c.listId === id ? { ...c, listId: 'all' } : c) // Move contacts to 'all' or keep them? Let's just reset listId
    })),

    clearAllContacts: () => set({ contacts: [] }),
    }),
    {
    name: 'address-book-storage',
    }
    )
);

export default useAddressStore;
