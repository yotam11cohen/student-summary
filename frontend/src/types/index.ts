export interface Student {
  id: number;
  name: string;
  created_at: string;
}

export interface Note {
  id: number;
  student_id: number;
  content: string;
  created_at: string;
}

export type Lang = 'en' | 'he';
