import type { Lang } from '../types';

export interface Translations {
  appTitle: string;
  noStudentSelected: string;
  addStudentPlaceholder: string;
  addStudentButton: string;
  studentsTitle: string;
  deleteStudent: string;
  confirmDelete: string;
  confirmYes: string;
  confirmNo: string;
  notesTitle: string;
  addNotePlaceholder: string;
  addNoteButton: string;
  noNotes: string;
  deleteNote: string;
  summaryTitle: string;
  generateButton: string;
  generatingButton: string;
  copyButton: string;
  copiedButton: string;
  summaryPlaceholder: string;
  noNotesWarning: string;
  errorLoadStudents: string;
  errorAddStudent: string;
  errorDeleteStudent: string;
  errorLoadNotes: string;
  errorAddNote: string;
  errorDeleteNote: string;
  errorGenerateSummary: string;
}

const translations: Record<Lang, Translations> = {
  en: {
    appTitle: 'Teacher Observation Journal',
    noStudentSelected: 'Select a student to begin',
    addStudentPlaceholder: 'Student name...',
    addStudentButton: 'Add',
    studentsTitle: 'Students',
    deleteStudent: 'Delete student',
    confirmDelete: 'Are you sure?',
    confirmYes: 'Yes',
    confirmNo: 'Cancel',
    notesTitle: 'Observation Notes',
    addNotePlaceholder: 'Write an observation...',
    addNoteButton: 'Add Note',
    noNotes: 'No notes yet. Add your first observation above.',
    deleteNote: 'Delete note',
    summaryTitle: 'AI Summary',
    generateButton: 'Generate Summary',
    generatingButton: 'Generating...',
    copyButton: 'Copy to Clipboard',
    copiedButton: 'Copied!',
    summaryPlaceholder: 'The summary will appear here after generation.',
    noNotesWarning: 'Add at least one note before generating a summary.',
    errorLoadStudents: 'Failed to load students.',
    errorAddStudent: 'Failed to add student.',
    errorDeleteStudent: 'Failed to delete student.',
    errorLoadNotes: 'Failed to load notes.',
    errorAddNote: 'Failed to add note.',
    errorDeleteNote: 'Failed to delete note.',
    errorGenerateSummary: 'Failed to generate summary. Please try again.',
  },
  he: {
    appTitle: 'יומן תצפיות מורה',
    noStudentSelected: 'בחר תלמיד כדי להתחיל',
    addStudentPlaceholder: 'שם התלמיד...',
    addStudentButton: 'הוסף',
    studentsTitle: 'תלמידים',
    deleteStudent: 'מחק תלמיד',
    confirmDelete: 'בטוח?',
    confirmYes: 'כן',
    confirmNo: 'ביטול',
    notesTitle: 'הערות תצפית',
    addNotePlaceholder: 'כתוב תצפית...',
    addNoteButton: 'הוסף הערה',
    noNotes: 'אין הערות עדיין. הוסף את התצפית הראשונה שלך למעלה.',
    deleteNote: 'מחק הערה',
    summaryTitle: 'סיכום AI',
    generateButton: 'צור סיכום',
    generatingButton: 'יוצר סיכום...',
    copyButton: 'העתק ללוח',
    copiedButton: 'הועתק!',
    summaryPlaceholder: 'הסיכום יופיע כאן לאחר יצירה.',
    noNotesWarning: 'הוסף לפחות הערה אחת לפני יצירת הסיכום.',
    errorLoadStudents: 'שגיאה בטעינת רשימת התלמידים.',
    errorAddStudent: 'שגיאה בהוספת תלמיד.',
    errorDeleteStudent: 'שגיאה במחיקת תלמיד.',
    errorLoadNotes: 'שגיאה בטעינת ההערות.',
    errorAddNote: 'שגיאה בהוספת הערה.',
    errorDeleteNote: 'שגיאה במחיקת ההערה.',
    errorGenerateSummary: 'שגיאה ביצירת הסיכום. נסה שוב.',
  },
};

export default translations;
