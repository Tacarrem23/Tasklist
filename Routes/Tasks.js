const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

// POST /tasks
router.post('/', async (req, res) => {
  const { title, done } = req.body;
  if (typeof title !== 'string' || typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Invalid task data' });
  }

  const result = await db.query(
    'INSERT INTO tasks (title, done, user_id) VALUES ($1, $2, $3) RETURNING *',
    [title, done, req.user.id]
  );
  res.status(201).json(result.rows[0]);
});

// GET /tasks
router.get('/', async (req, res) => {
  const tasks = await db.query(
    'SELECT * FROM tasks WHERE user_id = $1',
    [req.user.id]
  );
  res.json(tasks.rows);
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  const { title, done } = req.body;
  if (typeof title !== 'string' || typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Invalid task data' });
  }

  const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  const task = taskRes.rows[0];

  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const updated = await db.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [title, done, req.params.id]
  );
  res.json(updated.rows[0]);
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  const task = taskRes.rows[0];

  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;

