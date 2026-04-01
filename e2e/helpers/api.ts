const API_BASE = 'http://localhost:3001/api';

export async function deleteAllStudents(): Promise<void> {
  const res = await fetch(`${API_BASE}/students`);
  const students = (await res.json()) as { id: number }[];
  await Promise.all(
    students.map((s) =>
      fetch(`${API_BASE}/students/${s.id}`, { method: 'DELETE' })
    )
  );
}

export async function createStudent(name: string): Promise<{ id: number; name: string }> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json() as Promise<{ id: number; name: string }>;
}

export async function createNote(
  studentId: number,
  content: string
): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, content }),
  });
  return res.json() as Promise<{ id: number }>;
}
