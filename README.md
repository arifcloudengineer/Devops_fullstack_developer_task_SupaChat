# SupaChat — Conversational Analytics

> Ask your blog analytics database anything in plain English. Powered by **Groq AI (Llama 3.3)** + Supabase + DevOps-grade infrastructure.

🔗 **GitHub:** https://github.com/Shaikarif143/Devops_fullstack_developer_task_SupaChat

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
                        ├── Groq AI llama-3.3-70b (NL → SQL)
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
cd Devops_fullstack_developer_task_SupaChat
cp .env.example .env
# Edit .env with your keys
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → create new project
2. Open **SQL Editor** → paste contents of `backend/seed.sql` → Run
3. Copy your **Project URL** and **anon key** into `.env`

### 3. Configure .env

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGci...your-anon-key...
GROQ_API_KEY=gsk_your-groq-key-here
APP_ENV=development
```

> 🔑 Get free Groq API key at [console.groq.com](https://console.groq.com) — no credit card needed

### 4. Run locally with Docker

```bash
docker-compose up -d
```

| Service    | URL                   | Credentials       |
|------------|-----------------------|-------------------|
| App        | http://localhost      | —                 |
| Backend    | http://localhost:8000 | —                 |
| API Docs   | http://localhost:8000/docs | —            |
| Prometheus | http://localhost:9090 | —                 |
| Grafana    | http://localhost:3001 | admin / admin123  |
| Loki       | http://localhost:3100 | —                 |

---

## 🚀 Deploy to AWS EC2

### 1. Launch EC2 Instance

- AMI: **Ubuntu 22.04 LTS**
- Instance type: **t2.micro** (free tier eligible)
- Security Group — open inbound ports:

| Port | Purpose       |
|------|---------------|
| 22   | SSH           |
| 80   | App (HTTP)    |
| 3001 | Grafana       |
| 9090 | Prometheus    |

### 2. First-time setup on EC2

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

✅ Your app is live at `http://YOUR_EC2_IP`

---

## 🔁 CI/CD — GitHub Actions

### Setup Secrets

Go to GitHub repo → **Settings → Secrets → Actions** → add:

| Secret Name  | Value                          |
|--------------|--------------------------------|
| `EC2_HOST`   | Your EC2 public IP address     |
| `EC2_SSH_KEY`| Full contents of your .pem file|

### Pipeline Flow

```
Push to main
    │
    ├── 1. Test  — Python lint + React build
    ├── 2. Build — Docker images → push to GHCR
    └── 3. Deploy → EC2 zero-downtime rolling restart
```

Every push to `main` auto-deploys in ~3 minutes. ✅

---

## 📊 Monitoring Dashboards

### Grafana Setup

1. Open `http://YOUR_IP:3001`
2. Login: `admin` / `admin123`
3. Import dashboard **ID: 1860** → Node Exporter Full (CPU/memory/disk)
4. Import dashboard **ID: 14282** → Docker container metrics
5. Connect **Loki** datasource for application logs

### What's Monitored

| Metric | Tool |
|--------|------|
| CPU & memory per container | Prometheus + Grafana |
| HTTP request rate & latency | FastAPI /metrics |
| Container health status | Docker + Prometheus |
| Application logs | Loki + Promtail |
| Error logs | Loki query: `{container_name="supachat-backend"} \|= "ERROR"` |

---

## 🤖 DevOps Agent (Bonus)

AI-powered operations assistant using Groq AI:

```bash
# Check system health
python devops_agent.py health

# AI-summarized log analysis
python devops_agent.py logs

# Full system diagnosis with fix recommendations
python devops_agent.py diagnose

# Zero-downtime deploy with AI failure analysis
python devops_agent.py deploy

# Safe restart all containers
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
|-------|------------|
| Frontend | React 18, Vite, Recharts |
| Backend | FastAPI, Python 3.11 |
| AI (NL→SQL) | Groq API — llama-3.3-70b-versatile (Free) |
| Database | Supabase (PostgreSQL) |
| Containers | Docker, Docker Compose |
| Reverse Proxy | Nginx (gzip + caching + websocket) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Grafana, Loki, Promtail, Node Exporter |
| Cloud | AWS EC2 (Ubuntu 22.04) |

---

## 🤖 AI Tools Used

- **Claude (claude.ai)** — project scaffolding, architecture design, code generation
- **Groq API** — free LLM (llama-3.3-70b) for natural language to SQL conversion
- **Cursor** — AI-assisted code editing

---

## 📁 Project Structure

```
Devops_fullstack_developer_task_SupaChat/
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
│   ├── main.py                   # FastAPI + Groq NL→SQL
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
├── .github/
│   └── workflows/deploy.yml      # CI/CD pipeline
├── devops_agent.py               # Bonus: AI DevOps agent
├── docker-compose.yml            # Full stack orchestration
├── setup-ec2.sh                  # One-command EC2 setup
└── .env.example                  # Environment template
```

---

## 👤 Author

**Mahammad Arif Shaik**
AWS DevOps Engineer | Cloud Infrastructure | CI/CD | Kubernetes | Terraform

📧 shaikmahammadarif98@gmail.com
📱 +91 9490769794
🔗 [LinkedIn](https://www.linkedin.com/in/arif-awsengineer/) | [GitHub](https://github.com/Shaikarif143)