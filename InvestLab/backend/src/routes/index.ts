import { Router } from 'express';
import authRoutes from './authRoutes.js';
import stocksRoutes from './stocksRoutes.js';
import tradingRoutes from './tradingRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';
import sipRoutes from './sipRoutes.js';
import learningRoutes from './learningRoutes.js';
import quizRoutes from './quizRoutes.js';
import tutorRoutes from './tutorRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/stocks', stocksRoutes);
apiRouter.use('/trading', tradingRoutes);
apiRouter.use('/watchlist', watchlistRoutes);
apiRouter.use('/sip', sipRoutes);
apiRouter.use('/learning', learningRoutes);
apiRouter.use('/quizzes', quizRoutes);
apiRouter.use('/tutor', tutorRoutes);

apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: 'InvestLab FinTech API',
    version: '1.0.0',
    mode: 'PAPER_TRADING_SIMULATION',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
