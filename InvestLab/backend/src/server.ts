import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware in dev
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Root fallback
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'InvestLab FinTech Education API',
    description: 'Learn Investing by Doing - Paper Trading & Education Platform',
    status: 'online',
    disclaimer: 'This is a simulation platform for educational purposes. No real money or stock orders are handled.',
    documentation: '/docs',
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server if directly executed
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 InvestLab Backend API running on http://localhost:${config.port}`);
    console.log(`   Health check: http://localhost:${config.port}/api/health`);
    console.log(`   Demo Account: demo@investlab.in (Password: demo123)`);
    console.log(`=======================================================`);
  });
}

export default app;
