import express from 'express';
import { nanoid } from 'nanoid';
import db from './db.js';
import { db as sqlite } from './db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Получить все видео
router.get('/', async (req, res) => {
  try {
    const videos = sqlite.prepare('SELECT * FROM quiz_videos ORDER BY datetime(createdAt) DESC').all();
    res.json(videos);
  } catch (error) {
    console.error('Ошибка получения списка видео:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить видео по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = sqlite.prepare('SELECT * FROM quiz_videos WHERE id = ?').get(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Видео не найдено' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Ошибка получения видео:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать новое видео
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, difficulty, videoUrl, thumbnail, explanationVideoUrl } = req.body;

    // Валидация
    if (!title || !category || !difficulty || !videoUrl) {
      return res.status(400).json({ error: 'Название, категория, сложность и URL видео обязательны' });
    }

    if (!['offense', 'defense'].includes(category)) {
      return res.status(400).json({ error: 'Категория должна быть offense или defense' });
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return res.status(400).json({ error: 'Сложность должна быть beginner, intermediate или advanced' });
    }

    // Создаем новое видео
    const newVideo = {
      id: nanoid(),
      title: title.trim(),
      description: description?.trim() || null,
      category: category as 'offense' | 'defense',
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      videoUrl: videoUrl.trim(),
      thumbnail: thumbnail?.trim() || null,
      explanationVideoUrl: explanationVideoUrl?.trim() || null,
      createdAt: new Date().toISOString()
    };

    // Добавляем в БД
    sqlite.prepare(
      `INSERT INTO quiz_videos (id, title, description, category, difficulty, videoUrl, thumbnail, explanationVideoUrl, createdAt)
       VALUES (@id, @title, @description, @category, @difficulty, @videoUrl, @thumbnail, @explanationVideoUrl, @createdAt)`
    ).run(newVideo);

    res.status(201).json(newVideo);

  } catch (error) {
    console.error('Ошибка создания видео:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновить видео
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, videoUrl, thumbnail, explanationVideoUrl } = req.body;

    // Валидация
    if (category && !['offense', 'defense'].includes(category)) {
      return res.status(400).json({ error: 'Категория должна быть offense или defense' });
    }

    if (difficulty && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return res.status(400).json({ error: 'Сложность должна быть beginner, intermediate или advanced' });
    }

    const existing = sqlite.prepare('SELECT * FROM quiz_videos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Видео не найдено' });

    const updated = {
      ...existing,
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(videoUrl !== undefined ? { videoUrl: videoUrl.trim() } : {}),
      ...(thumbnail !== undefined ? { thumbnail: thumbnail?.trim() || null } : {}),
      ...(explanationVideoUrl !== undefined ? { explanationVideoUrl: explanationVideoUrl?.trim() || null } : {})
    };

    sqlite.prepare(
      `UPDATE quiz_videos SET title=@title, description=@description, category=@category, difficulty=@difficulty, videoUrl=@videoUrl, thumbnail=@thumbnail, explanationVideoUrl=@explanationVideoUrl WHERE id=@id`
    ).run(updated);

    res.json(updated);

  } catch (error) {
    console.error('Ошибка обновления видео:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить видео
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = sqlite.prepare('SELECT id FROM quiz_videos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Видео не найдено' });
    sqlite.prepare('DELETE FROM quiz_videos WHERE id = ?').run(id);
    res.status(204).send();

  } catch (error) {
    console.error('Ошибка удаления видео:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export { router as videoRoutes };


