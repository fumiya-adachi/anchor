import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import likesRoutes from './routes/likesRoutes';
import discoverRoutes from './routes/discoverRoutes';
import chatRoutes from './routes/chatRoutes';
import devRoutes from './routes/devRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/dev', devRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Anchor backend is running',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Add authentication routes
// app.post('/api/auth/signup', ...)
// app.post('/api/auth/signin', ...)
// app.post('/api/auth/refresh', ...)
// app.post('/api/auth/logout', ...)

// TODO: Add profile routes
// app.get('/api/profiles/:userId', ...)
// app.post('/api/profiles', ...)
// app.put('/api/profiles/:userId', ...)

// TODO: Add likes & matches routes
// app.post('/api/likes', ...)
// app.get('/api/matches', ...)

// TODO: Add chat routes
// app.post('/api/chats', ...)
// app.get('/api/chats/:userId', ...)

// Error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'サーバーエラーが発生しました',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Anchor backend running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
