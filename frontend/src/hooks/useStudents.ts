import { useState, useEffect, useCallback } from 'react';
import type { Student } from '../types';
import { api } from '../api/client';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getStudents();
      setStudents(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addStudent = async (name: string): Promise<void> => {
    const student = await api.createStudent(name);
    setStudents((prev) => [...prev, student]);
  };

  const deleteStudent = async (id: number) => {
    await api.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  return { students, loading, error, addStudent, deleteStudent };
}
