import express from 'express';
import { nanoid } from 'nanoid';
import { db as sqlite } from './db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Получить все плейлисты
router.get('/', async (req, res) => {
  try {
    const playlists = sqlite.prepare('SELECT * FROM playlists ORDER BY datetime(createdAt) DESC').all();
    res.json(playlists);
  } catch (error) {
    console.error('Ошибка получения плейлистов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить плейлист по ID (с элементами)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = sqlite.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });

    // Разворачиваем элементы по типу плейлиста
    let items: any[] = [];
    if ((playlist as any).kind === 'tactic') {
      items = sqlite.prepare(`
        SELECT tpi.tacticId as id, tpi.position, t.title, t.category, t.difficulty, t.thumbnail
        FROM tactic_playlist_items tpi
        JOIN tactics t ON t.id = tpi.tacticId
        WHERE tpi.playlistId = ?
        ORDER BY tpi.position ASC, datetime(t.createdAt) DESC
      `).all(id);
    } else {
      items = sqlite.prepare(`
        SELECT pi.videoId as id, pi.position, v.title, v.category, v.difficulty, v.thumbnail, v.videoUrl
        FROM playlist_items pi
        JOIN quiz_videos v ON v.id = pi.videoId
        WHERE pi.playlistId = ?
        ORDER BY pi.position ASC, datetime(v.createdAt) DESC
      `).all(id);
    }

    res.json({ ...playlist, items });
  } catch (error) {
    console.error('Ошибка получения плейлиста:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать плейлист
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, scenario, thumbnail, kind } = req.body;

    if (!title || !category || !scenario) {
      return res.status(400).json({ error: 'title, category и scenario обязательны' });
    }

    if (!['offense', 'defense'].includes(category)) {
      return res.status(400).json({ error: 'category должен быть offense или defense' });
    }

    if (!['endgame','transition','vs_zone','stars_breakdown','custom'].includes(scenario)) {
      return res.status(400).json({ error: 'недопустимое значение scenario' });
    }

    const playlist = {
      id: nanoid(),
      title: title.trim(),
      description: description?.trim() || null,
      category,
      scenario,
      thumbnail: thumbnail?.trim() || null,
      createdAt: new Date().toISOString(),
      kind: kind === 'tactic' ? 'tactic' : 'quiz'
    };

    sqlite.prepare(
      `INSERT INTO playlists (id, title, description, category, scenario, thumbnail, createdAt, kind)
       VALUES (@id, @title, @description, @category, @scenario, @thumbnail, @createdAt, @kind)`
    ).run(playlist);

    res.status(201).json(playlist);
  } catch (error) {
    console.error('Ошибка создания плейлиста:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновить плейлист
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, scenario, thumbnail, kind } = req.body;

    if (category && !['offense', 'defense'].includes(category)) {
      return res.status(400).json({ error: 'category должен быть offense или defense' });
    }
    if (scenario && !['endgame','transition','vs_zone','stars_breakdown','custom'].includes(scenario)) {
      return res.status(400).json({ error: 'недопустимое значение scenario' });
    }

    const existing = sqlite.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Плейлист не найден' });

    const updated = {
      ...existing,
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(scenario !== undefined ? { scenario } : {}),
      ...(thumbnail !== undefined ? { thumbnail: thumbnail?.trim() || null } : {}),
      ...(kind !== undefined ? { kind: kind === 'tactic' ? 'tactic' : 'quiz' } : {})
    };

    sqlite.prepare(
      `UPDATE playlists SET title=@title, description=@description, category=@category, scenario=@scenario, thumbnail=@thumbnail, kind=@kind WHERE id=@id`
    ).run(updated);

    res.json(updated);
  } catch (error) {
    console.error('Ошибка обновления плейлиста:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить плейлист (каскадно удалятся элементы)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = sqlite.prepare('SELECT id FROM playlists WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Плейлист не найден' });
    sqlite.prepare('DELETE FROM playlists WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления плейлиста:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить элементы плейлиста
router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = sqlite.prepare('SELECT kind FROM playlists WHERE id = ?').get(id);
    if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
    if ((playlist as any).kind === 'tactic') {
      const items = sqlite.prepare(`
        SELECT tpi.tacticId as id, tpi.position, t.title, t.category, t.difficulty, t.thumbnail
        FROM tactic_playlist_items tpi
        JOIN tactics t ON t.id = tpi.tacticId
        WHERE tpi.playlistId = ?
        ORDER BY tpi.position ASC, datetime(t.createdAt) DESC
      `).all(id);
      return res.json(items);
    } else {
      const items = sqlite.prepare(`
        SELECT pi.videoId as id, pi.position, v.title, v.category, v.difficulty, v.thumbnail, v.videoUrl
        FROM playlist_items pi
        JOIN quiz_videos v ON v.id = pi.videoId
        WHERE pi.playlistId = ?
        ORDER BY pi.position ASC, datetime(v.createdAt) DESC
      `).all(id);
      return res.json(items);
    }
  } catch (error) {
    console.error('Ошибка получения элементов плейлиста:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Добавить видео в плейлист
router.post('/:id/items', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId, tacticId, position } = req.body;

    const playlist = sqlite.prepare('SELECT id, kind FROM playlists WHERE id = ?').get(id);
    if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
    const pos = typeof position === 'number' ? position : 0;

    if ((playlist as any).kind === 'tactic') {
      if (!tacticId) return res.status(400).json({ error: 'tacticId обязателен для тактического плейлиста' });
      const tactic = sqlite.prepare('SELECT id FROM tactics WHERE id = ?').get(tacticId);
      if (!tactic) return res.status(404).json({ error: 'Тактика не найдена' });
      const existing = sqlite.prepare('SELECT 1 FROM tactic_playlist_items WHERE playlistId = ? AND tacticId = ?').get(id, tacticId);
      if (existing) return res.status(409).json({ error: 'Тактика уже в плейлисте' });
      sqlite.prepare(`INSERT INTO tactic_playlist_items (playlistId, tacticId, position) VALUES (?, ?, ?)`).run(id, tacticId, pos);
      res.status(201).json({ playlistId: id, tacticId, position: pos });
    } else {
      if (!videoId) return res.status(400).json({ error: 'videoId обязателен' });
      const video = sqlite.prepare('SELECT id FROM quiz_videos WHERE id = ?').get(videoId);
      if (!video) return res.status(404).json({ error: 'Видео не найдено' });
      const existing = sqlite.prepare('SELECT 1 FROM playlist_items WHERE playlistId = ? AND videoId = ?').get(id, videoId);
      if (existing) return res.status(409).json({ error: 'Видео уже в плейлисте' });
      sqlite.prepare(`INSERT INTO playlist_items (playlistId, videoId, position) VALUES (?, ?, ?)`).run(id, videoId, pos);
      res.status(201).json({ playlistId: id, videoId, position: pos });
    }
  } catch (error) {
    console.error('Ошибка добавления видео в плейлист:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновить позицию видео в плейлисте
router.put('/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { position } = req.body;
    if (typeof position !== 'number') return res.status(400).json({ error: 'position должен быть числом' });

    const playlist = sqlite.prepare('SELECT id, kind FROM playlists WHERE id = ?').get(id);
    if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });

    if ((playlist as any).kind === 'tactic') {
      const existing = sqlite.prepare('SELECT 1 FROM tactic_playlist_items WHERE playlistId = ? AND tacticId = ?').get(id, itemId);
      if (!existing) return res.status(404).json({ error: 'Элемент не найден' });
      sqlite.prepare(`UPDATE tactic_playlist_items SET position = ? WHERE playlistId = ? AND tacticId = ?`).run(position, id, itemId);
      res.json({ playlistId: id, tacticId: itemId, position });
    } else {
      const existing = sqlite.prepare('SELECT 1 FROM playlist_items WHERE playlistId = ? AND videoId = ?').get(id, itemId);
      if (!existing) return res.status(404).json({ error: 'Элемент не найден' });
      sqlite.prepare(`UPDATE playlist_items SET position = ? WHERE playlistId = ? AND videoId = ?`).run(position, id, itemId);
      res.json({ playlistId: id, videoId: itemId, position });
    }
  } catch (error) {
    console.error('Ошибка обновления позиции:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить видео из плейлиста
router.delete('/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const playlist = sqlite.prepare('SELECT id, kind FROM playlists WHERE id = ?').get(id);
    if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
    if ((playlist as any).kind === 'tactic') {
      const existing = sqlite.prepare('SELECT 1 FROM tactic_playlist_items WHERE playlistId = ? AND tacticId = ?').get(id, itemId);
      if (!existing) return res.status(404).json({ error: 'Элемент не найден' });
      sqlite.prepare('DELETE FROM tactic_playlist_items WHERE playlistId = ? AND tacticId = ?').run(id, itemId);
      res.status(204).send();
    } else {
      const existing = sqlite.prepare('SELECT 1 FROM playlist_items WHERE playlistId = ? AND videoId = ?').get(id, itemId);
      if (!existing) return res.status(404).json({ error: 'Элемент не найден' });
      sqlite.prepare('DELETE FROM playlist_items WHERE playlistId = ? AND videoId = ?').run(id, itemId);
      res.status(204).send();
    }
  } catch (error) {
    console.error('Ошибка удаления элемента:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;


