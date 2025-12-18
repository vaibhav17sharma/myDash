# Developer Dashboard 🚀

A powerful local developer dashboard that acts as a central hub for all your locally running projects with integrated terminal support.

## Features

### Project Management

- 📦 **Display Multiple Projects**: View all your running web projects in one place
- 🖼️ **Iframe Integration**: Each project loads inside an iframe for seamless viewing
- 👁️ **Show/Hide Projects**: Toggle project visibility on demand
- 🗑️ **Project CRUD**: Add, update, and delete projects easily
- 💾 **Persistent Storage**: Projects are saved to a local JSON file

### Terminal Integration

- 💻 **In-Browser Terminal**: Full-featured terminal running directly in your browser
- 🔄 **Live Streaming**: Real-time command output streaming
- 📑 **Multiple Tabs**: Support for multiple terminal sessions
- 🎯 **PTY Support**: Uses node-pty for true pseudo-terminal experience
- 🌐 **WebSocket Connection**: Real-time bidirectional communication
- ⚡ **Lazy Loading**: Terminals only connect when you switch to them (saves resources)
- 🎨 **xterm.js**: Professional terminal emulation with full ANSI color support

### UI/UX

- 🎨 **Premium Dark Theme**: Beautiful, modern design with glassmorphism effects
- ⌨️ **Keyboard Shortcuts**:
  - `Cmd/Ctrl + K`: Toggle terminal
  - `Cmd/Ctrl + 1-9`: Switch between projects
- 📏 **Resizable Terminal**: Drag to adjust terminal height
- 🎯 **Collapsible Sidebar**: Maximize screen space when needed
- ⚡ **Smooth Animations**: Polished micro-interactions throughout

## Installation

### Option 1: Docker (Recommended)

```bash
# Build and start with Docker Compose
docker-compose up -d

# Or use Make commands
make up
```

The dashboard will be available at: **http://localhost**

📖 See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm start

# Or run them separately:
npm run server  # Backend on port 3030
npm run dev     # Frontend on port 5173
```

The dashboard will be available at: **http://localhost:5173**

### Adding Projects

1. Click the **"Add Project"** button in the header
2. Fill in the project details:
   - **Name**: Your project name (e.g., "My React App")
   - **Port**: The port your project runs on (e.g., 3000)
   - **Path**: Optional path (default: "/")
   - **Show immediately**: Toggle to show/hide on creation
3. Click **"Add Project"**

### Using the Terminal

1. The terminal panel is at the bottom of the screen
2. Type commands and press **Enter** to execute
3. Click the **"+"** button to add new terminal tabs
4. Click the **"✕"** on a tab to close it
5. Use the **trash icon** to clear terminal output

### Managing Projects

- **Switch Projects**: Click on a project in the sidebar or use `Cmd/Ctrl + 1-9`
- **Hide/Show**: Click the eye icon in the header
- **Delete**: Click the trash icon in the header
- **Fullscreen**: Click the fullscreen icon in the project viewer
- **Open in New Tab**: Click the arrow icon

## Technical Stack

### Frontend

- **React 19** with Vite
- **Vanilla CSS** with custom design system
- **WebSocket** for terminal communication

### Backend

- **Node.js** with Express
- **node-pty** for pseudo-terminal support
- **ws** for WebSocket server
- **CORS** enabled for development

## Configuration

### Fixed Ports

- **Dashboard**: 5173 (Vite dev server)
- **Backend API**: 3030 (Express server)

### Project Storage

Projects are saved to: `/Users/vaibhavsharma/Dev/myDash/projects.json`

## Security Notes

⚠️ **Development Only**: This dashboard is designed for local development environments only.

- No authentication required
- Runs on localhost only
- Terminal has full system access
- Iframe security headers are relaxed
- **DO NOT** expose to the internet or production environments

## Keyboard Shortcuts

| Shortcut         | Action                |
| ---------------- | --------------------- |
| `Cmd/Ctrl + K`   | Toggle terminal panel |
| `Cmd/Ctrl + 1-9` | Switch to project 1-9 |

## Troubleshooting

### Project Not Loading in Iframe

- Ensure the project is actually running on the specified port
- Check if the project has X-Frame-Options headers that prevent iframe embedding
- Try opening in a new tab using the arrow icon

### Terminal Not Connecting

- Make sure the backend server is running on port 3030
- Check browser console for WebSocket connection errors
- Restart both frontend and backend

### Port Already in Use

- Change the port in `vite.config.js` (frontend) or `server.js` (backend)
- Make sure no other services are using ports 3030 or 5173

## Development

### Project Structure

```
myDash/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx/css
│   │   ├── ProjectManager.jsx/css
│   │   ├── ProjectViewer.jsx/css
│   │   └── Terminal.jsx/css
│   ├── App.jsx/css
│   └── index.css
├── server.js
├── vite.config.js
└── package.json
```

### Building for Production

```bash
npm run build
npm run preview
```

## Future Enhancements

- [ ] Project status indicators (running/stopped)
- [ ] Start/stop projects from terminal
- [ ] Custom terminal themes
- [ ] Project groups/categories
- [ ] Search and filter projects
- [ ] Terminal command history
- [ ] Export/import project configurations

## License

MIT - This is a development tool for personal use.

---

Built with ⚡ by Antigravity
