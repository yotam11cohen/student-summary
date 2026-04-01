import { useState } from 'react';
import type { Student } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface StudentListItemProps {
  student: Student;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => Promise<void>;
}

export function StudentListItem({
  student,
  isSelected,
  onSelect,
  onDelete,
}: StudentListItemProps) {
  const { t } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-brand-100 border-s-4 border-brand-500'
          : 'hover:bg-gray-100 border-s-4 border-transparent'
      }`}
      onClick={() => {
        if (!confirming) onSelect();
      }}
    >
      <span className="flex-1 text-sm font-medium text-gray-800 text-start truncate">
        {student.name}
      </span>

      {confirming ? (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
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
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(true);
          }}
          title={t('deleteStudent')}
          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
