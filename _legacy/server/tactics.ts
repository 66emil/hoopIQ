import express from 'express';
import { nanoid } from 'nanoid';
import { db as sqlite } from './db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Список тактик
router.get('/', async (_req, res) => {
  try {
    const rows = sqlite.prepare('SELECT * FROM tactics ORDER BY datetime(createdAt) DESC').all();
    const tactics = rows.map((r: any) => ({
      ...r,
      steps: JSON.parse(r.steps || '[]'),
      stepImages: r.stepImages ? JSON.parse(r.stepImages) : undefined,
      animation: r.animation ? JSON.parse(r.animation) : undefined
    }));
    res.json(tactics);
  } catch (e) {
    console.error('Ошибка списка тактик:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить тактику по id
router.get('/:id', async (req, res) => {
  try {
    const row = sqlite.prepare('SELECT * FROM tactics WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Тактика не найдена' });
    const tactic = {
      ...row,
      steps: JSON.parse(row.steps || '[]'),
      stepImages: row.stepImages ? JSON.parse(row.stepImages) : undefined,
      animation: row.animation ? JSON.parse(row.animation) : undefined
    };
    res.json(tactic);
  } catch (e) {
    console.error('Ошибка получения тактики:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать тактику
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, difficulty, steps, thumbnail, stepImages, animation } = req.body;
    if (!title || !description || !category || !difficulty || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Обязательные поля: title, description, category, difficulty, steps[]' });
    }
    if (!['offense','defense'].includes(category)) return res.status(400).json({ error: 'Неверная категория' });
    if (!['beginner','intermediate','advanced'].includes(difficulty)) return res.status(400).json({ error: 'Неверная сложность' });

    const item = {
      id: nanoid(),
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      difficulty,
      steps: JSON.stringify(steps || []),
      thumbnail: thumbnail ? String(thumbnail) : null,
      stepImages: stepImages ? JSON.stringify(stepImages) : null,
      animation: animation ? JSON.stringify(animation) : null,
      createdAt: new Date().toISOString()
    };

    sqlite.prepare(`
      INSERT INTO tactics (id, title, description, category, difficulty, steps, thumbnail, stepImages, animation, createdAt)
      VALUES (@id, @title, @description, @category, @difficulty, @steps, @thumbnail, @stepImages, @animation, @createdAt)
    `).run(item);

    res.status(201).json({
      ...item,
      steps,
      stepImages,
      animation
    });
  } catch (e) {
    console.error('Ошибка создания тактики:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновить тактику
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = sqlite.prepare('SELECT * FROM tactics WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Тактика не найдена' });
    const { title, description, category, difficulty, steps, thumbnail, stepImages, animation } = req.body;
    if (category && !['offense','defense'].includes(category)) return res.status(400).json({ error: 'Неверная категория' });
    if (difficulty && !['beginner','intermediate','advanced'].includes(difficulty)) return res.status(400).json({ error: 'Неверная сложность' });

    const updated = {
      ...existing,
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(steps !== undefined ? { steps: JSON.stringify(steps) } : {}),
      ...(thumbnail !== undefined ? { thumbnail: thumbnail ? String(thumbnail) : null } : {}),
      ...(stepImages !== undefined ? { stepImages: stepImages ? JSON.stringify(stepImages) : null } : {}),
      ...(animation !== undefined ? { animation: animation ? JSON.stringify(animation) : null } : {}),
    };

    sqlite.prepare(`
      UPDATE tactics SET title=@title, description=@description, category=@category, difficulty=@difficulty, steps=@steps, thumbnail=@thumbnail, stepImages=@stepImages, animation=@animation WHERE id=@id
    `).run(updated);

    res.json({
      ...updated,
      steps: steps !== undefined ? steps : JSON.parse(updated.steps),
      stepImages: stepImages !== undefined ? stepImages : (updated.stepImages ? JSON.parse(updated.stepImages) : undefined),
      animation: animation !== undefined ? animation : (updated.animation ? JSON.parse(updated.animation) : undefined),
    });
  } catch (e) {
    console.error('Ошибка обновления тактики:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить тактику
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = sqlite.prepare('SELECT id FROM tactics WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Тактика не найдена' });
    sqlite.prepare('DELETE FROM tactics WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error('Ошибка удаления тактики:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;


