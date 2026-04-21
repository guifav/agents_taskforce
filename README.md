# Agent Orchestrator Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Compatible-blue)](https://openclaw.ai)

A real-time web dashboard for managing OpenClaw agent teams, monitoring workflows, and tracking costs across multiple AI models.

Automatically discovers and controls your installed OpenClaw skills from `~/.openclaw/skills/`.

## Features

- **Real-time Monitoring**: Track active agents, their status, and current tasks
- **GitHub Integration**: View open PRs and issues from configured repositories
- **Cost Tracking**: Monitor token usage and costs per job/agent/model
- **Agent Flow Visualization**: See agents working in real-time with workflow diagrams
- **Model Management**: Monitor which models are in use across your agent team
- **Event Stream**: Real-time updates from agent activities

## Architecture

```
+-------------------------------------------------------------+
|                    Agent Orchestrator Dashboard             |
+-------------------------------------------------------------+
|  +--------------+  +--------------+  +------------------+  |
|  |   Frontend   |  |    API       |  |  Agent Workers   |  |
|  |  (React)     |  |  (FastAPI)   |  |   (Python)       |  |
|  +------+-------+  +------+-------+  +--------+---------+  |
|         |                 |                    |            |
|         +-----------------+--------------------+            |
|                           |                                 |
|                    +------+------+                         |
|                    |  WebSocket  |                         |
|                    |   Server    |                         |
|                    +------+------+                         |
|                           |                                 |
|         +-----------------+-----------------+              |
|         |                 |                 |              |
|    +---------+      +---------+      +----------+         |
|    |  Redis  |      |PostgreSQL|      |  GitHub  |         |
|    | (Cache) |      | (State)  |      |   API    |         |
|    +---------+      +---------+      +----------+         |
+-------------------------------------------------------------+
```

## Quick Start

### Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- OpenClaw CLI installed

### Installation

```bash
# Clone the repository
git clone https://github.com/guifav/agent-orchestrator-dashboard.git
cd agent-orchestrator-dashboard

# Configure environment
cp .env.example .env
# Edit .env with your GitHub token and OpenClaw config

# Start all services
docker-compose up -d

# Access dashboard
open http://localhost:8080
```

## Project Structure

```
agent-orchestrator-dashboard/
├── backend/
│   ├── api/                 # FastAPI application
│   ├── workers/             # Background job processors
│   ├── models/              # Database models
│   └── websocket/           # Real-time updates
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Dashboard views
│   │   └── hooks/           # Custom React hooks
│   └── public/
├── agents/                  # OpenClaw agent definitions
│   ├── github-monitor/
│   ├── cost-tracker/
│   └── workflow-orchestrator/
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
└── docs/
    ├── architecture.md
    ├── api-reference.md
    └── contributing.md
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Required |
| `OPENCLAW_PATH` | Path to OpenClaw binary | `/usr/local/bin/openclaw` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://...` |
| `DASHBOARD_PORT` | Web dashboard port | `8080` |
| `API_PORT` | Backend API port | `8000` |

### Agent Configuration

Configure your agent team in `agents/config.yaml`:

```yaml
agents:
  - name: code-reviewer
    skill: code-reviewer
    model: moonshot/kimi-k2.5
    max_cost_per_job: 0.50
    
  - name: qa-tester
    skill: qa-tester
    model: moonshot/kimi-k2.5
    max_cost_per_job: 0.30
    
  - name: github-guardian
    skill: github-guardian
    schedule: "*/10 * * * *"
    repositories:
      - guifav/virtuagency.ai
      - guifav/sync
```

## Dashboard Views

### 1. Agent Overview
- **Real-time status** of all discovered agents from `~/.openclaw/skills/`
- **Execute agents** directly from the UI
- **View/edit configurations** (config.json)
- **Schedule agents** via OpenClaw cron integration

### 2. GitHub Integration
- Open PRs across repositories
- Issue triage and assignment
- PR review status
- Trigger code-reviewer agent on PRs

### 3. Workflow Visualization
- Visual flow of agent interactions
- Handoff points between agents
- Job queue and processing status
- Real-time updates via WebSocket

### 4. Cost Analytics
- Token usage per model
- Cost breakdown by agent/job
- Budget alerts and limits
- Historical trends

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/{id}/status` - Agent status
- `POST /api/agents/{id}/spawn` - Spawn agent
- `GET /api/agents/{id}/logs` - Agent logs

### GitHub
- `GET /api/github/prs` - Open PRs
- `GET /api/github/issues` - Open issues
- `POST /api/github/prs/{id}/assign` - Assign to agent

### Monitoring
- `GET /api/metrics/tokens` - Token usage
- `GET /api/metrics/costs` - Cost metrics
- `GET /api/metrics/models` - Model usage
- `WS /api/stream` - Real-time events

## Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Run tests
make test

# Lint code
make lint

# Build production images
make build
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Roadmap

- [ ] Kubernetes deployment
- [ ] Multi-tenant support
- [ ] Custom agent builder UI
- [ ] Integration with LangSmith
- [ ] Mobile app companion

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- OpenClaw community for the agent orchestration patterns
- Contributors to the multi-agent architecture research

---

**Built for the OpenClaw ecosystem**
