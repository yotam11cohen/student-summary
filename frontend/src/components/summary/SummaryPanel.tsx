import type { Note } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useSummary } from '../../hooks/useSummary';
import { CopyButton } from './CopyButton';

interface SummaryPanelProps {
  studentId: number;
  studentName: string;
  notes: Note[];
}

export function SummaryPanel({ studentId, studentName, notes }: SummaryPanelProps) {
  const { t, lang } = useLanguage();
  const { summary, setSummary, loading, error, generate } = useSummary();

  const handleGenerate = () => {
    generate(
      studentId,
      studentName,
      notes.map((n) => n.content),
      lang
    );
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700 text-start">
          {t('summaryTitle')}
        </h2>
        <button
          onClick={handleGenerate}
          disabled={loading || notes.length === 0}
          title={notes.length === 0 ? t('noNotesWarning') : undefined}
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('generatingButton') : t('generateButton')}
        </button>
      </div>

      {notes.length === 0 && (
        <p className="mb-3 text-xs text-amber-600 text-start">{t('noNotesWarning')}</p>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-500 text-start">{t('errorGenerateSummary')}</p>
      )}

      {loading && (
        <div className="flex justify-center p-6">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={t('summaryPlaceholder')}
            rows={12}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-gray-400 text-start"
          />
          {summary && (
            <div className="mt-2 flex justify-end">
              <CopyButton text={summary} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
