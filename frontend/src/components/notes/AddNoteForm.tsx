import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface AddNoteFormProps {
  onAdd: (content: string) => Promise<void>;
}

export function AddNoteForm({ onAdd }: AddNoteFormProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setContent('');
    } catch {
      setError(t('errorAddNote'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('addNotePlaceholder')}
        disabled={loading}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-400 text-start"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : t('addNoteButton')}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 text-start">{error}</p>}
    </form>
  );
}
