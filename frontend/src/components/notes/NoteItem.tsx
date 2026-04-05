import { useState } from 'react';
import type { Note } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface NoteItemProps {
  note: Note;
  onDelete: () => Promise<void>;
  onEdit: (content: string) => Promise<void>;
}

export function NoteItem({ note, onDelete, onEdit }: NoteItemProps) {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<'view' | 'editing' | 'confirming'>('view');
  const [deleting, setDeleting] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setEditContent(note.content);
    setEditError(null);
    setMode('editing');
  };

  const handleCancelEdit = () => {
    setEditContent(note.content);
    setEditError(null);
    setMode('view');
  };

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    setEditError(null);
    try {
      await onEdit(trimmed);
      setMode('view');
    } catch {
      setEditError(t('errorEditNote'));
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(note.created_at));

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition-shadow">
      {mode === 'editing' ? (
        <>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-sm text-gray-800 leading-relaxed border border-gray-300 rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="text-xs text-gray-500 hover:underline disabled:opacity-50"
            >
              {t('cancelEdit')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || editContent.trim().length === 0}
              className="text-xs text-blue-600 font-medium hover:underline disabled:opacity-50"
            >
              {t('saveNote')}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap text-start">
            {note.content}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{formattedDate}</span>
            {mode === 'confirming' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('confirmDelete')}</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-600 font-medium hover:underline disabled:opacity-50"
                >
                  {t('confirmYes')}
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {t('confirmNo')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartEdit}
                  title={t('editNote')}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setMode('confirming')}
                  title={t('deleteNote')}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
