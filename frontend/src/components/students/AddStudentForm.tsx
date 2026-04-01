import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface AddStudentFormProps {
  onAdd: (name: string) => Promise<void>;
}

export function AddStudentForm({ onAdd }: AddStudentFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setName('');
    } catch {
      setError(t('errorAddStudent'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('addStudentPlaceholder')}
          disabled={loading}
          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-400 text-start"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="shrink-0 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('addStudentButton')}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 text-start">{error}</p>}
    </form>
  );
}
