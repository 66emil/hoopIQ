import express from 'express';
import { nanoid } from 'nanoid';
import { db as sqlite } from './db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Список квизов
router.get('/', async (_req, res) => {
  try {
    const rows = sqlite.prepare('SELECT * FROM quiz_questions ORDER BY datetime(createdAt) DESC').all();
    const quizzes = rows.map((r: any) => ({
      ...r,
      options: JSON.parse(r.options || '[]')
    }));
    res.json(quizzes);
  } catch (e) {
    console.error('Ошибка списка квизов:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить квиз по id
router.get('/:id', async (req, res) => {
  try {
    const row = sqlite.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Квиз не найден' });
    const quiz = { ...row, options: JSON.parse(row.options || '[]') };
    res.json(quiz);
  } catch (e) {
    console.error('Ошибка получения квиза:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать квиз
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, question, options, correctAnswer, explanation, difficulty, category, videoUrl, thumbnail, explanationVideoUrl } = req.body;
    if (!title || !question || !Array.isArray(options) || options.length < 2 || correctAnswer === undefined || correctAnswer === null || !explanation || !difficulty || !category || !videoUrl) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }
    if (correctAnswer < 0 || correctAnswer >= options.length) return res.status(400).json({ error: 'Индекс правильного ответа некорректен' });
    if (!['offense','defense'].includes(category)) return res.status(400).json({ error: 'Неверная категория' });
    if (!['beginner','intermediate','advanced'].includes(difficulty)) return res.status(400).json({ error: 'Неверная сложность' });

    const item = {
      id: nanoid(),
      title: String(title).trim(),
      question: String(question).trim(),
      options: JSON.stringify(options.map((o: any) => String(o))),
      correctAnswer: Number(correctAnswer),
      explanation: String(explanation).trim(),
      explanationVideoUrl: explanationVideoUrl ? String(explanationVideoUrl) : null,
      difficulty,
      category,
      videoUrl: String(videoUrl).trim(),
      thumbnail: thumbnail ? String(thumbnail) : null,
      createdAt: new Date().toISOString()
    };

    sqlite.prepare(`
      INSERT INTO quiz_questions (id, title, question, options, correctAnswer, explanation, explanationVideoUrl, difficulty, category, videoUrl, thumbnail, createdAt)
      VALUES (@id, @title, @question, @options, @correctAnswer, @explanation, @explanationVideoUrl, @difficulty, @category, @videoUrl, @thumbnail, @createdAt)
    `).run(item);

    res.status(201).json({ ...item, options });
  } catch (e) {
    console.error('Ошибка создания квиза:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновить квиз
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = sqlite.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Квиз не найден' });
    const { title, question, options, correctAnswer, explanation, difficulty, category, videoUrl, thumbnail, explanationVideoUrl } = req.body;
    if (category && !['offense','defense'].includes(category)) return res.status(400).json({ error: 'Неверная категория' });
    if (difficulty && !['beginner','intermediate','advanced'].includes(difficulty)) return res.status(400).json({ error: 'Неверная сложность' });
    if (options && (!Array.isArray(options) || options.length < 2)) return res.status(400).json({ error: 'Неверный формат options' });
    if (correctAnswer !== undefined && (correctAnswer < 0 || (options ? correctAnswer >= options.length : correctAnswer >= JSON.parse(existing.options).length))) return res.status(400).json({ error: 'Некорректный индекс правильного ответа' });

    const updated = {
      ...existing,
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(question !== undefined ? { question: String(question).trim() } : {}),
      ...(options !== undefined ? { options: JSON.stringify(options.map((o: any) => String(o))) } : {}),
      ...(correctAnswer !== undefined ? { correctAnswer: Number(correctAnswer) } : {}),
      ...(explanation !== undefined ? { explanation: String(explanation).trim() } : {}),
      ...(explanationVideoUrl !== undefined ? { explanationVideoUrl: explanationVideoUrl ? String(explanationVideoUrl) : null } : {}),
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(videoUrl !== undefined ? { videoUrl: String(videoUrl).trim() } : {}),
      ...(thumbnail !== undefined ? { thumbnail: thumbnail ? String(thumbnail) : null } : {}),
    };

    sqlite.prepare(`
      UPDATE quiz_questions SET title=@title, question=@question, options=@options, correctAnswer=@correctAnswer, explanation=@explanation, explanationVideoUrl=@explanationVideoUrl, difficulty=@difficulty, category=@category, videoUrl=@videoUrl, thumbnail=@thumbnail WHERE id=@id
    `).run(updated);

    res.json({ ...updated, options: options !== undefined ? options : JSON.parse(updated.options) });
  } catch (e) {
    console.error('Ошибка обновления квиза:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить квиз
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = sqlite.prepare('SELECT id FROM quiz_questions WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Квиз не найден' });
    sqlite.prepare('DELETE FROM quiz_questions WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error('Ошибка удаления квиза:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;


