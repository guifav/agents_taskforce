# Installation Guide

## Docker Installation (Recommended)

### Prerequisites

- Docker 24.0 or higher
- Docker Compose 2.20 or higher
- 2GB RAM minimum
- 10GB disk space

### Quick Install

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guifav/agents_taskforce.git
   cd agents_taskforce
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the dashboard:**
   ```
   http://localhost:8080
   ```

### Production Deployment

For production environments, use the production compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Configuration

Create a `.env` file:

```env
# Required
GITHUB_TOKEN=ghp_your_github_token

# Optional (defaults shown)
API_PORT=8000
DASHBOARD_PORT=8080
DB_USER=agentadmin
DB_PASSWORD=changeme
DB_NAME=agentdashboard
```

### Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Troubleshooting

**Port already in use:**
```bash
# Change ports in .env
API_PORT=8001
DASHBOARD_PORT=8081
```

**Database connection issues:**
```bash
# Check logs
docker logs agent-dashboard-db

# Reset database
docker-compose down -v
docker-compose up -d
```

**Container won't start:**
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

## Manual Installation

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup.
