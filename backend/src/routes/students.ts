import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';

export const studentsRouter = Router();

// GET /api/students
studentsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM students ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/students
studentsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const result = await pool.query(
      'INSERT INTO students (name) VALUES ($1) RETURNING id, name, created_at',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id
studentsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
