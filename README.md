# Diseases Map — National Disease Surveillance System

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Prisma](https://img.shields.io/badge/Prisma-6+-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/) [![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/) [![nginx](https://img.shields.io/badge/nginx-009639?style=flat&logo=nginx&logoColor=white)](https://nginx.org/) [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)](https://github.com/features/actions) [![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat&logo=grafana&logoColor=white)](https://grafana.com/)

A full-stack disease surveillance and reporting system for hospitals across Thailand, built with TypeScript and deployed on production infrastructure with Docker, nginx, SSL, and CI/CD automation.

**Live Demo:** https://diseases-map.phumitada.com  
**API:** https://diseases-map-api.phumitada.com

**Demo Account**
```
Username: admin_siriraj
Password: admin123
```

---

## Overview

This system enables hospital personnel to submit patient disease reports and provides public access to real-time disease statistics across all 77 provinces of Thailand through an interactive heatmap and data tables.

---

## Tech Stack

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, Zustand, Axios
- react-simple-maps (Geographic Heatmap)

**Backend**
- Node.js, Express, TypeScript
- PostgreSQL 16, Prisma ORM
- JWT Authentication (Access + Refresh Token)

**Infrastructure**
- Docker, Docker Compose
- nginx (Reverse Proxy + SSL Termination)
- Let's Encrypt (SSL Certificate)
- GitHub Actions (CI/CD Pipeline)
- DigitalOcean VPS (Ubuntu 24.04)
- Grafana, Prometheus, Loki (Observability)

---

## Architecture

```
Client (React + Vite)
  |-- HTTPS
  v
nginx (Reverse Proxy)
  |-- /                  --> Frontend Container  (port 5201)
  |-- api subdomain      --> Backend Container   (port 5002)
  v
Express API Server
  |-- /api/auth
  |-- /api/report
  |-- /api/hospital
  |-- /api/provinces
  |-- /api/dataProvince
  v
PostgreSQL Container     Redis Container
```

**Database Schema**
```
Province --< Hospital --< User
               |
               +--< Report >-- Disease
```

| Table    | Records | Description                    |
|----------|---------|--------------------------------|
| Province | 77      | All provinces in Thailand       |
| Hospital | 77+     | Hospitals per province          |
| Disease  | 13      | Diseases with ICD-10 codes      |
| User     | 12+     | Hospital personnel              |
| Report   | 5,000+  | Patient disease reports         |

---

## CI/CD Pipeline

Every push to `main` triggers the following pipeline via GitHub Actions:

```
git push origin main
  --> Run unit tests (Vitest)
  --> SSH into VPS
  --> git pull origin main
  --> docker compose up -d --build
```

Deployment only proceeds if all tests pass.

---

## Observability

Production monitoring is implemented with the Grafana PLG stack:

- **Prometheus** — Metrics collection (CPU, RAM, Disk, Network)
- **Node Exporter** — Host-level metrics
- **cAdvisor** — Per-container metrics
- **Loki + Promtail** — Centralized log aggregation
- **Grafana** — Dashboard and alerting

---

## Features

| Route         | Description                                      | Access   |
|---------------|--------------------------------------------------|----------|
| /             | Province heatmap with risk-level color coding    | Public   |
| /provinces    | Disease statistics table with filter, pagination | Public   |
| /statistics   | Latest 50 patient reports                        | Public   |
| /hospitals    | Hospital directory                               | Private  |
| /reporting    | Patient report submission form                   | Private  |

**Risk Classification**

| Level     | Range           |
|-----------|-----------------|
| Normal    | 0 - 500 cases   |
| Warning   | 501 - 3,000 cases |
| Emergency | 3,000+ cases    |

---

## Local Development

**Prerequisites**
- Node.js 22+
- Docker Desktop
- npm

**Option 1 — Docker (Recommended)**

```bash
git clone https://github.com/Phumitada/Diseases-Map-DevOps.git
cd Diseases-Map-DevOps

cp .env.example .env
# Edit .env with your values

docker compose up --build
```

Access the application at http://localhost:5201

**Option 2 — Manual**

```bash
# Backend
cd server
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend
cd client
npm install
npm run dev
```

**Environment Variables**

Create `.env` at project root:

```env
POSTGRES_DB=appdb
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://admin:your_password@db:5432/appdb
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=https://diseases-map.phumitada.com
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5002/api
```

---

## API Reference

**Authentication**

| Method | Endpoint            | Description              | Auth    |
|--------|---------------------|--------------------------|---------|
| POST   | /api/auth/login     | Login, receive tokens    | Public  |
| POST   | /api/auth/register  | Register new user        | Public  |
| POST   | /api/auth/refresh   | Refresh access token     | Public  |
| POST   | /api/auth/logout    | Logout, revoke token     | Private |

**Province Data**

| Method | Endpoint                    | Description                    | Query Params                    |
|--------|-----------------------------|--------------------------------|---------------------------------|
| GET    | /api/dataProvince           | Disease statistics by province | page, limit, order, risk        |
| GET    | /api/dataProvince/count     | Aggregate counts by type       | type (province/disease/total)   |
| GET    | /api/dataProvince/map       | Heatmap data                   | risk, order, disease            |

**Reports**

| Method | Endpoint          | Description               | Auth    |
|--------|-------------------|---------------------------|---------|
| GET    | /api/report/recent| Latest reports            | Public  |
| POST   | /api/report       | Submit patient report     | Private |

---

## Project Structure

```
Diseases-Map-DevOps/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/                # Axios client + interceptors
│   │   ├── components/         # Shared components
│   │   ├── features/           # Feature modules
│   │   ├── routes/             # React Router
│   │   └── stores/             # Zustand state
│   └── Dockerfile
├── server/                     # Express backend
│   ├── controllers/            # Request handlers
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth middleware
│   ├── prisma/                 # Schema + migrations
│   ├── seeds/                  # Seed scripts
│   └── tests/                  # Unit tests
│       ├── helpers/
│       │   └── mockPrisma.ts
│       └── units/
│           └── dataProvince.test.ts
├── shared/                     # Shared TypeScript types
├── Dockerfile.frontend
└── docker-compose.yml
```

---

## Authentication Flow

```
POST /api/auth/login
  --> Access Token  (15 minutes, Bearer)
  --> Refresh Token (7 days, stored in Redis)

Subsequent requests:
  Authorization: Bearer <access_token>

Token expired:
  --> Axios interceptor auto-calls POST /api/auth/refresh
  --> Retries original request
  --> Redirects to login if refresh token also expired
```