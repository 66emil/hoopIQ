import Database from 'better-sqlite3';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = path.join(__dirname, 'app.db');

export const db = new Database(DB_FILE);

export const initDB = async () => {
  try {
    // Включаем FK и создаем таблицы
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        name TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        points INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Текущая целевая схема таблицы видео (создаём только если отсутствует)
    db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('offense','defense')),
        difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
        videoUrl TEXT NOT NULL,
        thumbnail TEXT,
        explanationVideoUrl TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_quiz_videos_createdAt ON quiz_videos(createdAt);
    `);

    // Миграция со старой схемы (phase/difficulty в верхнем регистре, поле playlist)
    const pragma = db.prepare(`PRAGMA table_info(quiz_videos)`).all();
    const hasPhase = pragma.some((c: any) => c.name === 'phase');
    const hasCategory = pragma.some((c: any) => c.name === 'category');
    if (hasPhase && !hasCategory) {
      db.exec('BEGIN TRANSACTION');
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS quiz_videos_new (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL CHECK (category IN ('offense','defense')),
            difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
            videoUrl TEXT NOT NULL,
            thumbnail TEXT,
            createdAt TEXT NOT NULL
          );
        `);

        db.exec(`
          INSERT INTO quiz_videos_new (id, title, description, category, difficulty, videoUrl, thumbnail, createdAt)
          SELECT
            id,
            title,
            description,
            CASE phase WHEN 'ATTACK' THEN 'offense' WHEN 'DEFENSE' THEN 'defense' ELSE 'offense' END AS category,
            CASE difficulty WHEN 'BEGINNER' THEN 'beginner' WHEN 'MID' THEN 'intermediate' WHEN 'ADV' THEN 'advanced' ELSE 'beginner' END AS difficulty,
            videoUrl,
            thumbnail,
            createdAt
          FROM quiz_videos;
        `);

        db.exec(`DROP TABLE quiz_videos;`);
        db.exec(`ALTER TABLE quiz_videos_new RENAME TO quiz_videos;`);

        db.exec(`
          CREATE INDEX IF NOT EXISTS idx_quiz_videos_createdAt ON quiz_videos(createdAt);
          CREATE INDEX IF NOT EXISTS idx_quiz_videos_category ON quiz_videos(category);
          CREATE INDEX IF NOT EXISTS idx_quiz_videos_difficulty ON quiz_videos(difficulty);
        `);

        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    }

    // Если таблица уже была новой схемы с category/difficulty — убедимся, что индексы существуют
    const pragmaAfter = db.prepare(`PRAGMA table_info(quiz_videos)`).all();
    const hasCategoryNow = pragmaAfter.some((c: any) => c.name === 'category');
    const hasDifficultyNow = pragmaAfter.some((c: any) => c.name === 'difficulty');
    if (hasCategoryNow && hasDifficultyNow) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_quiz_videos_category ON quiz_videos(category);
        CREATE INDEX IF NOT EXISTS idx_quiz_videos_difficulty ON quiz_videos(difficulty);
      `);
    }

    // Плейлисты и связи
    db.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('offense','defense')),
        scenario TEXT NOT NULL CHECK (scenario IN ('endgame','transition','vs_zone','stars_breakdown','custom')),
        thumbnail TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS playlist_items (
        playlistId TEXT NOT NULL,
        videoId TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (playlistId, videoId),
        FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (videoId) REFERENCES quiz_videos(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_playlists_category ON playlists(category);
      CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlistId);
      CREATE INDEX IF NOT EXISTS idx_playlist_items_video ON playlist_items(videoId);
    `);
    console.log('SQLite DB initialized at', DB_FILE);
  } catch (error) {
    console.error('DB init error:', error);
    throw error;
  }
};

export default db;


