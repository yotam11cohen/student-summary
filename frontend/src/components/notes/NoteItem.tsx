import { useState } from 'react';
import type { Note } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface NoteItemProps {
  note: Note;
  onDelete: () => Promise<void>;
}

export function NoteItem({ note, onDelete }: NoteItemProps) {
  const { t, lang } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(note.created_at));

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition-shadow">
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap text-start">
        {note.content}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">{formattedDate}</span>
        {confirming ? (
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
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-500 hover:underline"
            >
              {t('confirmNo')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            title={t('deleteNote')}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
