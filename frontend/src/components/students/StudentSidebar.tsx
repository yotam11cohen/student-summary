import type { Student } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AddStudentForm } from './AddStudentForm';
import { StudentListItem } from './StudentListItem';

interface StudentSidebarProps {
  students: Student[];
  selectedId: number | null;
  loading: boolean;
  error: string | null;
  onSelect: (student: Student) => void;
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function StudentSidebar({
  students,
  selectedId,
  loading,
  error,
  onSelect,
  onAdd,
  onDelete,
}: StudentSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t('studentsTitle')}
        </h2>
      </div>

      <AddStudentForm onAdd={onAdd} />

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <p className="p-4 text-sm text-red-500 text-start">{t('errorLoadStudents')}</p>
        )}
        {!loading && !error && students.length === 0 && (
          <p className="p-4 text-sm text-gray-400 text-start">{t('addStudentPlaceholder')}</p>
        )}
        {students.map((student) => (
          <StudentListItem
            key={student.id}
            student={student}
            isSelected={student.id === selectedId}
            onSelect={() => onSelect(student)}
            onDelete={() => onDelete(student.id)}
          />
        ))}
      </div>
    </div>
  );
}
