import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';
import { api } from '../api/client';

export function useNotes(studentId: number | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (studentId === null) {
      setNotes([]);
      return;
    }
    setLoading(true);
    try {
      setError(null);
      const data = await api.getNotes(studentId);
      setNotes(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const addNote = async (content: string) => {
    if (studentId === null) return;
    const note = await api.createNote(studentId, content);
    setNotes((prev) => [note, ...prev]);
  };

  const deleteNote = async (id: number) => {
    await api.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNote = async (id: number, content: string) => {
    const updated = await api.updateNote(id, content);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  return { notes, loading, error, addNote, deleteNote, updateNote };
}
