# ⚡ TaskFlow — MERN Stack Task Manager

A production-ready MERN stack application with full CI/CD pipeline using Jenkins and AWS deployment.

## 📁 Project Structure

```
mern-devops-app/
├── backend/                    # Express.js REST API
│   ├── models/                 # Mongoose models (User, Task)
│   ├── routes/                 # API routes (auth, tasks, health)
│   ├── middleware/             # JWT auth middleware
│   ├── server.js               # Entry point
│   ├── Dockerfile              # Multi-stage backend image
│   └── .env.example
├── frontend/                   # React 18 SPA
│   ├── src/
│   │   ├── context/            # Auth context (JWT management)
│   │   ├── pages/              # Login, Register, Dashboard
│   │   └── components/         # TaskCard, TaskModal
│   ├── nginx/nginx.conf        # Nginx config (SPA + API proxy)
│   └── Dockerfile              # Multi-stage: build → nginx
├── docker-compose.yml          # Full stack orchestration
├── Jenkinsfile                 # CI/CD pipeline
└── .github/workflows/          # GitHub Actions (alternative)
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+, Docker & Docker Compose, MongoDB (or use Docker)

### 1. Clone and configure

```bash
git clone https://github.com/<your-username>/taskflow.git
cd taskflow
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 2. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

App available at: **http://localhost**
Backend API: **http://localhost/api**
Health check: **http://localhost/health**

### 3. Run locally without Docker

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm start
```

---

## ☁️ AWS Deployment Setup

### Infrastructure Required
- **EC2 instance** (Ubuntu 22.04, t2.micro or larger)
- **Amazon ECR** — two repos: `taskflow-backend`, `taskflow-frontend`
- **Security Groups**: ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Step 1 — Prepare EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@<EC2_IP>

# Install Docker & Docker Compose
sudo apt update && sudo apt install -y docker.io docker-compose-plugin awscli
sudo usermod -aG docker ubuntu
newgrp docker

# Install AWS CLI and configure
aws configure   # enter your IAM credentials

# Create app directory
mkdir -p /home/ubuntu/taskflow
```

### Step 2 — Create ECR Repositories

```bash
aws ecr create-repository --repository-name taskflow-backend  --region ap-south-1
aws ecr create-repository --repository-name taskflow-frontend --region ap-south-1
```

### Step 3 — Configure Jenkins Credentials

Add these credentials in **Jenkins → Manage Jenkins → Credentials**:

| Credential ID         | Type         | Value                                  |
|-----------------------|--------------|----------------------------------------|
| `ecr-registry-url`    | Secret text  | `<account-id>.dkr.ecr.ap-south-1.amazonaws.com` |
| `ec2-host`            | Secret text  | Your EC2 public IP or DNS              |
| `ec2-ssh-private-key` | SSH key      | Your `.pem` private key                |
| `aws-credentials`     | AWS keys     | IAM Access Key + Secret Key            |
| `mongo-uri-prod`      | Secret text  | `mongodb://user:pass@host/db`          |
| `jwt-secret-prod`     | Secret text  | A strong random secret                 |
| `client-url-prod`     | Secret text  | `http://<your-ec2-ip>`                 |

### Step 4 — Jenkins Pipeline Setup

1. Install Jenkins plugins: **Pipeline**, **NodeJS**, **AWS Credentials**, **SSH Agent**, **AnsiColor**, **HTML Publisher**
2. Go to **Jenkins → New Item → Pipeline**
3. Set SCM to your GitHub repo
4. Script path: `Jenkinsfile`
5. Enable **GitHub hook trigger for GITScm polling**

---

## 🔄 CI/CD Pipeline Stages

```
Checkout → Install Deps → Test (parallel) → Build Images → Push to ECR → Deploy → Smoke Test
```

| Stage           | Description                                              |
|-----------------|----------------------------------------------------------|
| Checkout        | Pull source code, extract git metadata                   |
| Install Deps    | `npm ci` for backend and frontend in parallel            |
| Test            | Jest unit tests with coverage reports                    |
| Build Images    | Multi-stage Docker builds (only on `main` branch)        |
| Push to ECR     | Tag with `build#-gitsha`, push `latest` too              |
| Deploy to EC2   | SCP compose file, SSH in, pull images, restart services  |
| Smoke Test      | HTTP health check against live environment               |

---

## 🛡️ API Endpoints

### Auth
| Method | Endpoint               | Auth | Description        |
|--------|------------------------|------|--------------------|
| POST   | `/api/auth/register`   | ❌   | Register new user  |
| POST   | `/api/auth/login`      | ❌   | Login, get JWT     |
| GET    | `/api/auth/me`         | ✅   | Get current user   |

### Tasks
| Method | Endpoint               | Auth | Description             |
|--------|------------------------|------|-------------------------|
| GET    | `/api/tasks`           | ✅   | List tasks (filterable) |
| POST   | `/api/tasks`           | ✅   | Create task             |
| PUT    | `/api/tasks/:id`       | ✅   | Update task             |
| DELETE | `/api/tasks/:id`       | ✅   | Delete task             |

### Health
| Method | Endpoint   | Auth | Description                  |
|--------|------------|------|------------------------------|
| GET    | `/health`  | ❌   | DB + memory health status    |

---

## 🔧 Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://user:pass@host:27017/dbname?authSource=admin
JWT_SECRET=your_strong_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://your-domain.com
```

---

## 🧰 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, React Router v6, Axios        |
| Backend     | Node.js, Express.js, Mongoose           |
| Database    | MongoDB 6.0                             |
| Auth        | JWT (jsonwebtoken) + bcryptjs           |
| Reverse Proxy | Nginx (Alpine)                        |
| Containers  | Docker, Docker Compose                  |
| Registry    | Amazon ECR                              |
| Server      | Amazon EC2 (Ubuntu)                     |
| CI/CD       | Jenkins Pipeline / GitHub Actions       |
