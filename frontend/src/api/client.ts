import type { Student, Note, Lang } from '../types';

const BASE = 'http://localhost:3001/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Students
  getStudents(): Promise<Student[]> {
    return fetch(`${BASE}/students`).then(handleResponse<Student[]>);
  },

  createStudent(name: string): Promise<Student> {
    return fetch(`${BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(handleResponse<Student>);
  },

  deleteStudent(id: number): Promise<void> {
    return fetch(`${BASE}/students/${id}`, { method: 'DELETE' }).then(
      handleResponse<void>
    );
  },

  // Notes
  getNotes(studentId: number): Promise<Note[]> {
    return fetch(`${BASE}/notes?studentId=${studentId}`).then(
      handleResponse<Note[]>
    );
  },

  createNote(studentId: number, content: string): Promise<Note> {
    return fetch(`${BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, content }),
    }).then(handleResponse<Note>);
  },

  deleteNote(id: number): Promise<void> {
    return fetch(`${BASE}/notes/${id}`, { method: 'DELETE' }).then(
      handleResponse<void>
    );
  },

  // Summary
  generateSummary(
    studentId: number,
    studentName: string,
    notes: string[],
    language: Lang
  ): Promise<{ summary: string }> {
    return fetch(`${BASE}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, studentName, notes, language }),
    }).then(handleResponse<{ summary: string }>);
  },
};
