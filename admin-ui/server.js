import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3010;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'local-dev-admin-secret';
const NETLIFY_ADMIN_URL = process.env.VERCEL_ADMIN_URL || process.env.NETLIFY_ADMIN_URL || 'https://x-twitter-auto-reply-10x-extension.vercel.app/api/admin';

app.use(cors());
app.use(express.json());

// Proxy endpoints for Admin UI - secret remains on local server, never sent to browser bundle
app.get('/api/admin/users', async (req, res) => {
  try {
    const search = req.query.q ? `?q=${encodeURIComponent(req.query.q)}` : '';
    const response = await fetch(`${NETLIFY_ADMIN_URL}${search}`, {
      headers: {
        'x-admin-secret': ADMIN_SECRET
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Local admin server proxy error:', err);
    res.status(500).json({ error: 'Failed to communicate with Netlify Admin backend' });
  }
});

app.patch('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${NETLIFY_ADMIN_URL}?id=${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Local admin server proxy error:', err);
    res.status(500).json({ error: 'Failed to communicate with Netlify Admin backend' });
  }
});

// Serve static build if dist exists
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

let currentPort = parseInt(process.env.PORT || '3010', 10);

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n🚀 Local Admin Dashboard server running at: http://localhost:${port}`);
    console.log(`   Connected to Netlify Admin Backend: ${NETLIFY_ADMIN_URL}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use, trying http://localhost:${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(currentPort);

