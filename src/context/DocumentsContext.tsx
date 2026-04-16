import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { ChamberDocument } from '../types';

const STORAGE_KEY = 'nexus_documents_state';

interface DocumentsContextType {
  documents: ChamberDocument[];
  addDocument: (doc: Omit<ChamberDocument, 'id' | 'status'>) => void;
  updateStatus: (id: string, status: ChamberDocument['status']) => void;
  signDocument: (id: string, signature: string) => void;
  deleteDocument: (id: string) => void;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function loadState(): ChamberDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    {
      id: newId(),
      title: 'Initial Draft Agreement',
      fileName: 'Draft_v1.pdf',
      uploadedBy: 'e1',
      status: 'draft',
      fileType: 'application/pdf',
      fileData: '', // Mock data
    },
  ];
}

export const DocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<ChamberDocument[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDocuments(loadState());
    setHydrated(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setDocuments(parsed);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      // ignore
    }
  }, [documents, hydrated]);

  const addDocument = useCallback((doc: Omit<ChamberDocument, 'id' | 'status'>) => {
    const newDoc: ChamberDocument = {
      id: newId(),
      title: doc.title,
      fileName: doc.fileName,
      fileData: doc.fileData,
      fileType: doc.fileType,
      uploadedBy: doc.uploadedBy,
      status: 'draft',
    };
    setDocuments((prev) => [newDoc, ...prev]);
    toast.success('Document uploaded');
  }, []);

  const updateStatus = useCallback((id: string, status: ChamberDocument['status']) => {
    setDocuments((prev) => {
      const found = prev.find((d) => d.id === id);
      if (!found) return prev;
      return prev.map((d) => (d.id === id ? { ...d, status } : d));
    });
    toast.success(`Document status changed to ${status.replace('_', ' ')}`);
  }, []);

  const signDocument = useCallback((id: string, signature: string) => {
    setDocuments((prev) => {
      const found = prev.find((d) => d.id === id);
      if (!found || found.status !== 'in_review') {
        return prev;
      }
      return prev.map((d) => (d.id === id ? { ...d, status: 'signed', signature } : d));
    });
    // Assume success for UI responsiveness; in a real app check backend response.
    toast.success('Document signed successfully');
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document deleted');
  }, []);

  const value = useMemo(
    () => ({ documents, addDocument, updateStatus, signDocument, deleteDocument }),
    [documents, addDocument, updateStatus, signDocument, deleteDocument]
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
};

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentsProvider');
  return ctx;
}
