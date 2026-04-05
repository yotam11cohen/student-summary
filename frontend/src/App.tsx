import { useState } from 'react';
import type { Student } from './types';
import { useLanguage } from './context/LanguageContext';
import { useStudents } from './hooks/useStudents';
import { useNotes } from './hooks/useNotes';
import { AppShell } from './components/layout/AppShell';
import { StudentSidebar } from './components/students/StudentSidebar';
import { NotesPanel } from './components/notes/NotesPanel';
import { SummaryPanel } from './components/summary/SummaryPanel';

function WorkspaceContent({ student }: { student: Student | null }) {
  const { t } = useLanguage();
  const { notes, loading, error, addNote, deleteNote, updateNote } = useNotes(
    student?.id ?? null
  );

  if (!student) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400 text-lg">{t('noStudentSelected')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-start">
        {student.name}
      </h2>
      <NotesPanel
        notes={notes}
        loading={loading}
        error={error}
        onAdd={addNote}
        onDelete={deleteNote}
        onEdit={updateNote}
      />
      <SummaryPanel
        studentId={student.id}
        studentName={student.name}
        notes={notes}
      />
    </div>
  );
}

export default function App() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { students, loading, error, addStudent, deleteStudent } = useStudents();

  const handleDelete = async (id: number) => {
    await deleteStudent(id);
    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
    }
  };

  return (
    <AppShell
      sidebar={
        <StudentSidebar
          students={students}
          selectedId={selectedStudent?.id ?? null}
          loading={loading}
          error={error}
          onSelect={setSelectedStudent}
          onAdd={addStudent}
          onDelete={handleDelete}
        />
      }
      main={<WorkspaceContent student={selectedStudent} />}
    />
  );
}
