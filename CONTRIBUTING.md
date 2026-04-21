# Contributing to Agent Orchestrator Dashboard

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/agent-orchestrator-dashboard.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Submit a pull request

## 📋 Development Setup

```bash
# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Start development servers
docker-compose -f docker-compose.dev.yml up
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Kubernetes deployment manifests
- [ ] Authentication system (OAuth, API keys)
- [ ] Real-time log streaming from agents
- [ ] Mobile-responsive UI improvements
- [ ] Additional CI/CD integrations

### Features
- [ ] Custom agent builder UI
- [ ] Workflow visual editor
- [ ] Cost alerting and budgets
- [ ] Multi-tenant support
- [ ] Agent marketplace integration

### Integrations
- [ ] LangSmith observability
- [ ] Weights & Biases tracking
- [ ] Slack/Discord notifications
- [ ] PagerDuty alerting

## 📝 Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Write docstrings for all functions
- Run `flake8` and `black` before committing

### JavaScript/React (Frontend)
- Use functional components with hooks
- Follow Airbnb style guide
- Use Tailwind CSS for styling
- Write tests for new components

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test
```

## 📤 Submitting Changes

1. Ensure tests pass
2. Update documentation
3. Add entry to CHANGELOG.md
4. Submit PR with clear description

## 💬 Questions?

Open an issue or join our Discord: [link]

Thank you for contributing! 🎉
