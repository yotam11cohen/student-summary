import type { Note } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AddNoteForm } from './AddNoteForm';
import { NoteItem } from './NoteItem';

interface NotesPanelProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onAdd: (content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function NotesPanel({ notes, loading, error, onAdd, onDelete }: NotesPanelProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-700 mb-3 text-start">
        {t('notesTitle')}
      </h2>

      <AddNoteForm onAdd={onAdd} />

      {error && (
        <p className="mb-3 text-sm text-red-500 text-start">{t('errorLoadNotes')}</p>
      )}

      {loading && (
        <div className="flex justify-center p-6">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && notes.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-start">{t('noNotes')}</p>
      )}

      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onDelete={() => onDelete(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
