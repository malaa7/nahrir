import { create } from 'zustand';

const useWhiteboardStore = create((set, get) => ({
    pages: [{
    id: 1,
    elements: [],
    undoStack: [],
    redoStack: [],
    backgroundColor: '#ffffff',
    backgroundPattern: 'solid',
    pdfDoc: null,
    currentPdfPage: 1,
    pdfScale: 1,
    pdfPosition: { x: 0, y: 0 }
    }],
    currentPageIndex: 0,

    setPages: (pages) => set({ pages }),
    setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

    updateCurrentPage: (updates) => set((state) => {
    const newPages = [...state.pages];
    newPages[state.currentPageIndex] = {
    ...newPages[state.currentPageIndex],
    ...updates
    };
    return { pages: newPages };
    }),

    addPage: () => set((state) => ({
    pages: [...state.pages, {
    id: Date.now(),
    elements: [],
    undoStack: [],
    redoStack: [],
    backgroundColor: '#ffffff',
    backgroundPattern: 'solid',
    pdfDoc: null,
    currentPdfPage: 1,
    pdfScale: 1,
    pdfPosition: { x: 0, y: 0 }
    }],
    currentPageIndex: state.pages.length
    })),

    removePage: (index) => set((state) => {
    if (state.pages.length === 1) return state;
    const newPages = state.pages.filter((_, i) => i !== index);
    const newIndex = Math.min(state.currentPageIndex, newPages.length - 1);
    return { pages: newPages, currentPageIndex: newIndex };
    }),

    clearCurrentPage: () => set((state) => {
    const newPages = [...state.pages];
    newPages[state.currentPageIndex] = {
    ...newPages[state.currentPageIndex],
    elements: [],
    undoStack: [],
    redoStack: []
    };
    return { pages: newPages };
    })
}));

export default useWhiteboardStore;
