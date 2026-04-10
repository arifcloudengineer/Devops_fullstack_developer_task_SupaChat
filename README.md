# SupaChat — Conversational Analytics

> Ask your blog analytics database anything in plain English. Powered by Claude AI + Supabase + DevOps-grade infrastructure.

![SupaChat Architecture](https://via.placeholder.com/800x400?text=SupaChat+Architecture)

---

## 🏗️ Architecture

```
User Browser
    │
    ▼
[Nginx :80]  ← Reverse Proxy (gzip, caching, websocket)
    ├── /        → Frontend (React + Recharts) :3000
    └── /api     → Backend (FastAPI) :8000
                        │
                        ├── Claude AI (NL → SQL)
                        └── Supabase PostgreSQL

Monitoring Stack:
  Prometheus :9090  ←  scrapes metrics
  Grafana    :3001  ←  dashboards
  Loki       :3100  ←  log aggregation
  Promtail          ←  log collector
  Node Exporter :9100
```

---

## ⚡ Quick Start (Local)

### 1. Clone & configure

```bash
git clone https://github.com/Shaikarif143/Devops_fullstack_developer_task_SupaChat.git
cd supachat
cp .env.example .env
# Edit .env with your Supabase + Anthropic API keys
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → create new project
2. Open **SQL Editor** → paste contents of `backend/seed.sql` → Run
3. Copy your **Project URL** and **anon key** into `.env`

### 3. Run locally with Docker

```bash
docker-compose up -d
```

| Service    | URL                        |
|------------|----------------------------|
| App        | http://localhost           |
| Backend    | http://localhost:8000      |
| Prometheus | http://localhost:9090      |
| Grafana    | http://localhost:3001      |
| Loki       | http://localhost:3100      |

---

## 🚀 Deploy to AWS EC2

### 1. Launch EC2

- AMI: Ubuntu 22.04 LTS
- Instance: t2.micro (free tier) or t2.small
- Security Group — open ports: 22, 80, 3001, 9090

### 2. First-time setup

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
bash setup-ec2.sh
```

### 3. Configure and start

```bash
cd ~/supachat
nano .env          # Add your real API keys
docker-compose up -d
```

Your app is live at `http://YOUR_EC2_IP`

---

## 🔁 CI/CD — GitHub Actions

### Setup Secrets

In your GitHub repo → Settings → Secrets → Actions, add:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 public IP |
| `EC2_SSH_KEY` | Contents of your `.pem` file |

### Pipeline Flow

```
Push to main
    │
    ├── Test (Python lint + React build)
    ├── Build Docker images → push to GHCR
    └── Deploy to EC2 (zero-downtime rolling restart)
```

Every push to `main` auto-deploys within ~3 minutes.

---

## 📊 Monitoring Dashboards

### Grafana Setup

1. Open http://YOUR_IP:3001
2. Login: `admin` / `admin123`
3. Import dashboard ID **1860** (Node Exporter Full) for system metrics
4. Import dashboard ID **14282** for Docker container metrics
5. Connect Loki datasource for logs

### What's Monitored

- CPU & memory usage per container
- HTTP request rate & latency (FastAPI /metrics)
- Container health status
- Application logs (via Loki)
- Error logs with alerting

---

## 🤖 DevOps Agent (Bonus)

AI-powered operations assistant:

```bash
# Check system health
python devops_agent.py health

# AI-summarized log analysis
python devops_agent.py logs

# Full system diagnosis with recommendations
python devops_agent.py diagnose

# Zero-downtime deploy with AI failure analysis
python devops_agent.py deploy

# Safe restart
python devops_agent.py restart
```

---

## 🧩 Example Queries

- "Show top trending topics in last 30 days"
- "Compare article engagement by topic"
- "Plot daily views trend for AI articles"
- "Which author has the most total views?"
- "Show articles with most comments this month"
- "Top 5 most liked articles"

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts |
| Backend | FastAPI, Python 3.11 |
| AI | Claude claude-sonnet-4-20250514 (NL→SQL) |
| Database | Supabase (PostgreSQL) |
| Containers | Docker, Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Grafana, Loki, Promtail |
| Cloud | AWS EC2 |

---

## 🤖 AI Tools Used

- **Claude (claude.ai)** — project scaffolding, code generation, debugging
- **Claude Code** — terminal-based agentic coding
- **Cursor** — AI-assisted code editing

---

## 📁 Project Structure

```
supachat/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Query history + sample queries
│   │   │   ├── ChatPanel.jsx     # Chat UI + input
│   │   │   └── ResultPanel.jsx   # Tables + Recharts graphs
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── main.py                   # FastAPI + Claude NL→SQL
│   ├── seed.sql                  # Supabase schema + sample data
│   ├── requirements.txt
│   └── Dockerfile
├── nginx/
│   └── nginx.conf                # Reverse proxy config
├── monitoring/
│   ├── prometheus/prometheus.yml
│   ├── loki/loki-config.yml
│   ├── loki/promtail-config.yml
│   └── grafana/provisioning/
├── .github/workflows/deploy.yml  # CI/CD pipeline
├── devops_agent.py               # Bonus: AI DevOps agent
├── docker-compose.yml
├── setup-ec2.sh
└── .env.example
```

---

## 👤 Author

**Mahammad Arif Shaik**  
AWS DevOps Engineer  
[LinkedIn](https://www.linkedin.com/in/arif-awsengineer/) | [GitHub](https://github.com/Shaikarif143)
