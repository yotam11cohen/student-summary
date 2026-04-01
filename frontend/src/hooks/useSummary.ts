import { useState } from 'react';
import type { Lang } from '../types';
import { api } from '../api/client';

export function useSummary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    studentId: number,
    studentName: string,
    notes: string[],
    lang: Lang
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { summary: text } = await api.generateSummary(
        studentId,
        studentName,
        notes,
        lang
      );
      setSummary(text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSummary('');
    setError(null);
  };

  return { summary, setSummary, loading, error, generate, reset };
}
