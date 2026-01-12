import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { initDatabase } from './database.js';
import profileRoutes from './routes/profile.js';
import accountsRoutes from './routes/accounts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/accounts', accountsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files in production
if (NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist');
  if (existsSync(distPath)) {
    // Serve static files (JS, CSS, images, etc.)
    app.use(express.static(distPath));
    
    // Serve index.html for all non-API routes (SPA routing)
    // This must be after static files but before error handler
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next(); // Let API routes handle 404s
      }
      res.sendFile(join(distPath, 'index.html'));
    });
  } else {
    console.warn('Production mode but dist directory not found. Static files will not be served.');
  }
}

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
