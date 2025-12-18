# myDash - Docker Deployment

## Architecture

myDash uses a Docker-centric architecture:

- **Frontend**: Uses port mapping (`80:80`) - served via nginx
- **Backend**: Runs with `network_mode: host` for terminal access to host system
- **Terminal**: Has full access to host filesystem and Docker socket

### Network Architecture

```
Browser (localhost:80)
       ↓
Frontend Container (port 80)
       ↓ proxy to host.docker.internal:3030
Backend Container (host network, port 3030)
       ↓
Host System (terminal access)
```

### Important Limitation

⚠️ **Localhost Projects Access**

With this configuration:

- ❌ Frontend **CANNOT** access projects on `localhost:3000`, `localhost:8080`, etc.
- ✅ Frontend **CAN** access projects on your machine's IP address (e.g., `192.168.1.x:3000`)
- ✅ Terminal **CAN** access everything on the host

**Workaround for localhost projects:**

1. **Use machine IP instead of localhost:**

   ```
   Instead of: http://localhost:3000
   Use: http://192.168.1.100:3000
   ```

2. **Or use host network for frontend** (see Alternative Setup below)

### Alternative Setup (Host Network for Frontend)

If you need to access localhost projects, use host network mode for frontend:

```yaml
frontend:
  network_mode: host
  # Remove ports section
```

This allows frontend to access `localhost` projects but uses host port 80 directly.

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access

- **Dashboard**: http://localhost
- **Backend API**: http://localhost:3030 (runs on host network)

## Terminal Access

The terminal provides **full host system access**:

```
Terminal in Browser
       ↓
WebSocket to Backend Container
       ↓
Backend (network_mode: host)
       ↓
Host Filesystem (mounted at /host)
       ↓
Execute commands on HOST system
```

**Key Features:**

- ✅ Terminal runs commands on the **host machine**, not inside container
- ✅ Access to host filesystem via `/host` mount
- ✅ Can manage Docker containers via Docker socket
- ✅ Full system access with `privileged: true`

## Configuration

### Environment Variables

Create a `.env` file (optional):

```env
NODE_ENV=production
BACKEND_PORT=3030
```

### Volumes

- `./projects.json` - Persists project configurations
- `/var/run/docker.sock` - Docker socket for terminal access

## Development vs Production

### Development

```bash
# Use the existing npm scripts
npm run server  # Backend
npm run dev     # Frontend
```

### Production

```bash
# Use Docker Compose
docker-compose up -d
```

## Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Frontend can't access localhost projects

Make sure the frontend is using `network_mode: host`:

```yaml
frontend:
  network_mode: host
```

### Backend connection issues

Check if backend is running:

```bash
docker-compose ps
docker-compose logs backend
```

### Terminal not working

Ensure Docker socket is mounted:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

## Security Notes

⚠️ **CRITICAL: Development/Local Use Only**

This setup is designed for **local development only** and has significant security implications:

### Terminal Access

- 🔴 **Full host system access** - Terminal can execute ANY command on your host machine
- 🔴 **Privileged container** - Backend runs with `privileged: true`
- 🔴 **Root filesystem mounted** - Entire host filesystem accessible at `/host`
- 🔴 **Docker socket exposed** - Can create/destroy containers

### Network

- 🔴 **Host network mode** - Bypasses Docker network isolation
- 🔴 **No authentication** - Anyone with access can use the terminal
- 🔴 **No encryption** - WebSocket traffic is unencrypted

### ⚠️ DO NOT:

- ❌ Expose to the internet
- ❌ Use in production
- ❌ Run on shared/public networks
- ❌ Allow untrusted users access

### ✅ Safe Usage:

- ✅ Local development only
- ✅ Trusted network (localhost)
- ✅ Single user access
- ✅ Behind firewall

## Advanced Configuration

### Custom Port

To run on a different port, modify `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "8080:80"
  # Remove network_mode: host if using port mapping
```

Note: Using port mapping instead of host mode will prevent access to localhost projects.

### Resource Limits

Add resource constraints:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
```

## File Structure

```
myDash/
├── Dockerfile.frontend      # Frontend build
├── Dockerfile.backend       # Backend build
├── docker-compose.yml       # Orchestration
├── nginx.conf              # Nginx config
├── .dockerignore           # Build exclusions
└── projects.json           # Project data (created at runtime)
```

## Benefits of Docker Deployment

✅ **Consistent environment** across machines
✅ **Easy deployment** with single command
✅ **Isolated dependencies** in containers
✅ **Host network access** for localhost projects
✅ **Persistent data** with volumes
✅ **Easy updates** with rebuild

---

Built with 🐳 Docker
