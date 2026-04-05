import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';

export const notesRouter = Router();

// GET /api/notes?studentId=:id
notesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      res.status(400).json({ error: 'studentId query param is required' });
      return;
    }
    const result = await pool.query(
      'SELECT id, student_id, content, created_at FROM notes WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes
notesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, content } = req.body;
    if (!studentId) {
      res.status(400).json({ error: 'studentId is required' });
      return;
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    // Verify student exists
    const student = await pool.query('SELECT id FROM students WHERE id = $1', [studentId]);
    if (student.rowCount === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO notes (student_id, content) VALUES ($1, $2) RETURNING id, student_id, content, created_at',
      [studentId, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
notesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id
notesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'content is required' });
      return;
    }
    const result = await pool.query(
      'UPDATE notes SET content = $1 WHERE id = $2 RETURNING id, student_id, content, created_at',
      [content.trim(), id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
