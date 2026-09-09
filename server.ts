import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth';
import patientRoutes from './server/routes/patients';
import doctorRoutes from './server/routes/doctors';
import emergencyRoutes from './server/routes/emergency';
import hospitalRoutes from './server/routes/hospital';
import aiRoutes from './server/routes/ai';
import uidaiRoutes from './server/routes/uidai';
import { store } from './server/data/store';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(cors());
  app.use(express.json());

  // Health and System Diagnostics
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'E-KAVACH Backend Core',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    });
  });

  // Reset Mock Database state
  app.post('/api/system/reset-data', (_req, res) => {
    store.resetData();
    res.json({ success: true, message: 'All in-memory patient, bed, and triage records reset to default state.' });
  });

  // Domain API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/emergency', emergencyRoutes);
  app.use('/api/hospital', hospitalRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/uidai', uidaiRoutes);

  // Vite Middleware / SPA Static fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
      next();
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[E-KAVACH] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
