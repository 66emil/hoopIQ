import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { authRoutes } from './auth.js';
import { videoRoutes } from './videos.js';
import playlistsRouter from './playlists.js';
import { initDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5174;

// Middleware
const corsOptions: cors.CorsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Логирование всех запросов для диагностики
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

app.use(bodyParser.json());
app.use(cookieParser());

// Инициализация БД
initDB().then(() => {
  console.log('База данных готова к работе');
}).catch(error => {
  console.error('Ошибка инициализации БД:', error);
  process.exit(1);
});

// Routes
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);
app.use('/playlists', playlistsRouter);

// Главная страница API
app.get('/', (req, res) => {
  res.json({
    message: 'Баскетбольный API сервер',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      videos: '/videos',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


