import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Standard middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'order-service',
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes under /api
app.use('/api', orderRoutes);

// 404 handler for undefined endpoints
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` 🚀 OrderFlow AI: Order Service is running!`);
  console.log(` 📡 URL: http://localhost:${PORT}`);
  console.log(` 🩺 Health: http://localhost:${PORT}/health`);
  console.log(` 📦 Create Order: POST http://localhost:${PORT}/api/orders`);
  console.log(`===============================================`);
});
