import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn as ptySpawn } from 'node-pty';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3030; // Fixed port for the dashboard
const CONFIG_FILE = join(__dirname, 'projects.json');

app.use(cors());
app.use(express.json());

// Load/Save project configurations
function loadProjects() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
  return [];
}

function saveProjects(projects) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

// API endpoints
app.get('/api/projects', (req, res) => {
  res.json(loadProjects());
});

app.post('/api/projects', (req, res) => {
  const projects = loadProjects();
  const newProject = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveProjects(projects);
  res.json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...req.body };
    saveProjects(projects);
    res.json(projects[index]);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  let projects = loadProjects();
  projects = projects.filter(p => p.id !== req.params.id);
  saveProjects(projects);
  res.json({ success: true });
});

// Proxy endpoint to forward requests to localhost projects on host
// Usage: /proxy/3000/path -> http://host.docker.internal:3000/path
app.use('/proxy/:port', (req, res, next) => {
  const port = req.params.port;
  const proxy = createProxyMiddleware({
    target: `http://host.docker.internal:${port}`,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Remove /proxy/PORT from the path
      return path.replace(`/proxy/${port}`, '');
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(502).json({ error: 'Bad Gateway', message: err.message });
    },
  });
  proxy(req, res, next);
});

// Create HTTP server
const server = createServer(app);

// WebSocket server for terminal sessions
const wss = new WebSocketServer({ server, path: '/terminal' });

// Store active terminal sessions
const terminals = new Map();

wss.on('connection', (ws) => {
  console.log('New terminal connection');
  
  let terminalId = null;
  let ptyProcess = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'create':
          // Create a new terminal session
          terminalId = message.id || Date.now().toString();
          
          // Use sh for Alpine Linux, bash for other Unix, powershell for Windows
          let shell;
          if (process.platform === 'win32') {
            shell = 'powershell.exe';
          } else {
            // Try to use bash, fallback to sh (available in Alpine)
            shell = 'sh';
          }
          
          const cwd = message.cwd || process.env.HOME || process.cwd();
          
          ptyProcess = ptySpawn(shell, [], {
            name: 'xterm-color',
            cols: message.cols || 80,
            rows: message.rows || 24,
            cwd: cwd,
            env: process.env
          });

          terminals.set(terminalId, { ptyProcess, ws });

          // Send terminal output to client
          ptyProcess.onData((data) => {
            if (ws.readyState === 1) { // OPEN
              ws.send(JSON.stringify({
                type: 'output',
                id: terminalId,
                data: data
              }));
            }
          });

          ptyProcess.onExit(({ exitCode }) => {
            console.log(`Terminal ${terminalId} exited with code ${exitCode}`);
            terminals.delete(terminalId);
            if (ws.readyState === 1) {
              ws.send(JSON.stringify({
                type: 'exit',
                id: terminalId,
                exitCode
              }));
            }
          });

          ws.send(JSON.stringify({
            type: 'created',
            id: terminalId
          }));
          break;

        case 'input':
          // Send input to terminal
          if (ptyProcess && message.data) {
            ptyProcess.write(message.data);
          }
          break;

        case 'resize':
          // Resize terminal
          if (ptyProcess && message.cols && message.rows) {
            ptyProcess.resize(message.cols, message.rows);
          }
          break;

        case 'close':
          // Close terminal session
          if (ptyProcess) {
            ptyProcess.kill();
            terminals.delete(terminalId);
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Terminal connection closed');
    if (ptyProcess) {
      ptyProcess.kill();
      if (terminalId) {
        terminals.delete(terminalId);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Developer Dashboard running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket terminal server ready`);
});
