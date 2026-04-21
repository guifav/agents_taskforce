# Agent Orchestrator Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Compatible-orange)](https://openclaw.ai)

A modern, real-time dashboard for managing OpenClaw agent teams. Monitor your agents, track workflows, and visualize costs - all in one place.

![Dashboard Preview](https://via.placeholder.com/800x400/000000/ffbe00?text=Agent+Orchestrator+Dashboard)

## Features

- **Agent Management**: View all your OpenClaw skills in one place
- **Real-time Status**: Monitor agent status and health
- **Workflow Visualization**: See your agent pipelines in action
- **GitHub Integration**: Track PRs and issues from your repositories
- **Cost Analytics**: Monitor token usage and spending
- **Modern UI**: Clean, minimalist interface with dark mode

## Quick Start (Docker)

The easiest way to run the dashboard is with Docker:

```bash
# Clone the repository
git clone https://github.com/guifav/agents_taskforce.git
cd agents_taskforce

# Start all services
docker-compose up -d

# Access the dashboard
open http://localhost:8080
```

That's it! The dashboard will be available at http://localhost:8080

## Requirements

- Docker 24.0+
- Docker Compose 2.20+
- OpenClaw CLI (optional, for full functionality)

## Configuration

Create a `.env` file in the project root:

```env
# GitHub Token (optional, for GitHub integration)
GITHUB_TOKEN=ghp_your_token_here

# Ports
API_PORT=8000
DASHBOARD_PORT=8080

# Database
DB_USER=agentadmin
DB_PASSWORD=changeme
DB_NAME=agentdashboard
```

## Docker Services

The docker-compose.yml includes:

| Service | Description | Port |
|---------|-------------|------|
| `frontend` | React dashboard | 8080 |
| `backend` | FastAPI API | 8000 |
| `postgres` | PostgreSQL database | 5433 |
| `redis` | Redis cache | 6379 |

## Development

### Local Development (Full Functionality)

For development with access to OpenClaw CLI:

```bash
# 1. Start database services
docker-compose up -d postgres redis

# 2. Start backend locally
./start-local.sh

# 3. Start frontend (in another terminal)
cd frontend && npm install && npm start
```

### Building from Source

```bash
# Build all images
docker-compose build

# Or build individually
docker build -f docker/Dockerfile.backend -t agent-dashboard-backend .
docker build -f docker/Dockerfile.frontend -t agent-dashboard-frontend .
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│     Backend     │────▶│   PostgreSQL    │
│   (React)       │     │   (FastAPI)     │     │   (Database)    │
│   Port 8080     │◄────│   Port 8000     │◄────│   Port 5433     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │     Redis       │
                        │   (Cache)       │
                        │   Port 6379     │
                        └─────────────────┘
```

## API Endpoints

- `GET /api/agents` - List all agents
- `GET /api/agents/{id}/status` - Get agent status
- `POST /api/agents/{id}/run` - Execute agent
- `GET /api/github/prs` - List GitHub PRs
- `GET /api/github/issues` - List GitHub issues
- `GET /api/metrics/dashboard` - Get metrics
- `WS /ws` - WebSocket for real-time updates

## Screenshots

### Dashboard Overview
![Dashboard](docs/images/dashboard.png)

### Agent Management
![Agents](docs/images/agents.png)

### GitHub Integration
![GitHub](docs/images/github.png)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Submit a pull request

## Roadmap

- [ ] Kubernetes deployment
- [ ] Multi-tenant support
- [ ] Agent execution via UI
- [ ] Custom workflows
- [ ] Mobile app

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [OpenClaw](https://openclaw.ai) - The agent platform
- [shadcn/ui](https://ui.shadcn.com) - UI component inspiration
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

**Built with ♥ for the OpenClaw community**
