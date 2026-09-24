# 🚀 DeployServers

A self-hosted deployment platform that connects GitHub repositories to automated application deployments using webhooks, background workers, Redis, BullMQ, Docker, and Traefik.

DeployServers automates the journey from a **GitHub push to a running application**.

Instead of manually pulling code, building the application, starting containers, and configuring routing, DeployServers separates these responsibilities across an API service and a dedicated deployment worker.

```text
GitHub Push
     │
     ▼
GitHub Webhook
     │
     ▼
Backend API
     │
     ▼
BullMQ + Redis
     │
     ▼
Deployment Worker
     │
     ▼
Docker Container
     │
     ▼
Traefik
     │
     ▼
Deployed Application
```

---

## ⚡ Core Capabilities

- 🔐 GitHub OAuth authentication
- 📦 Import and manage GitHub repositories
- 🚀 Create deployable projects
- 🪝 Automatic GitHub webhook registration
- ⚡ Automatic deployment on repository push
- 📨 Asynchronous deployment using BullMQ
- 🔴 Redis-backed deployment queue
- 👷 Dedicated background deployment worker
- 🐳 Docker-based application deployment
- 🌐 Dynamic routing using Traefik
- 🔀 Host-based routing to deployed containers
- 📊 Deployment status tracking
- 🔑 JWT authentication with HTTP-only cookies
- 🗄️ MongoDB for users, projects, and deployment metadata

---

## 🏗️ Architecture

DeployServers is split into independent services responsible for different parts of the deployment lifecycle.

```text
                         ┌───────────────────┐
                         │      GitHub       │
                         │                   │
                         │ Repository / Push │
                         └─────────┬─────────┘
                                   │
                              Webhook Event
                                   │
                                   ▼
                         ┌───────────────────┐
                         │    Backend API    │
                         │                   │
                         │ OAuth             │
                         │ Authentication   │
                         │ Projects          │
                         │ Webhooks          │
                         └─────────┬─────────┘
                                   │
                              Create Job
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   Redis + BullMQ  │
                         │                   │
                         │   deploy-queue    │
                         └─────────┬─────────┘
                                   │
                              Consume Job
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Deployment Worker │
                         │                   │
                         │ Clone             │
                         │ Build             │
                         │ Deploy            │
                         └─────────┬─────────┘
                                   │
                            Create Container
                                   │
                                   ▼
                         ┌───────────────────┐
                         │      Docker       │
                         │                   │
                         │  Application      │
                         │   Containers      │
                         └─────────┬─────────┘
                                   │
                              Dynamic Routing
                                   │
                                   ▼
                         ┌───────────────────┐
                         │      Traefik      │
                         │   Reverse Proxy   │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
             Application A                Application B
             app1.example.com             app2.example.com
```

---

## 🔄 Deployment Flow

### 1. GitHub Authentication

Users authenticate through GitHub OAuth.

```text
User
 │
 ▼
GitHub OAuth
 │
 ▼
Backend
 │
 ▼
JWT Authentication
```

The backend maintains the authenticated session using JWT-based authentication.

---

### 2. Repository Selection

After authentication, the application retrieves repositories accessible to the user through the GitHub API.

```text
GitHub API
    │
    ▼
Repository List
    │
    ▼
DeployServers Dashboard
    │
    ▼
Select Repository
    │
    ▼
Create Project
```

Each project stores the information required to connect the GitHub repository with its deployment configuration.

---

### 3. Webhook Registration

When a project is created, DeployServers registers a webhook with the corresponding GitHub repository.

```text
GitHub Repository
       │
       │ push event
       ▼
DeployServers Webhook
```

This removes the need for continuous polling of GitHub.

---

### 4. Webhook Validation

When GitHub sends a webhook event, the backend validates the request signature before processing it.

```text
GitHub Payload
      │
      ▼
HMAC-SHA256 Verification
      │
      ├── Invalid ──► Reject
      │
      └── Valid
           │
           ▼
      Process Event
```

Only verified webhook events are allowed to trigger deployments.

---

### 5. Deployment Job Creation

For a valid push event, the backend creates a deployment job instead of performing the deployment inside the HTTP request.

```text
GitHub Push
    │
    ▼
Webhook
    │
    ▼
Backend
    │
    ▼
BullMQ Job
    │
    ▼
Redis
```

This keeps the API responsive while the deployment runs independently.

---

### 6. Background Deployment

The deployment worker consumes jobs from the Redis-backed BullMQ queue.

```text
Deployment Job
      │
      ▼
Worker
      │
      ▼
Clone Repository
      │
      ▼
Build Application
      │
      ▼
Create / Start Docker Container
      │
      ▼
Configure Routing
```

Long-running deployment operations are therefore isolated from the API server.

---

### 7. Dynamic Routing with Traefik

DeployServers uses **Traefik as the reverse proxy** for deployed applications.

Instead of manually configuring a reverse proxy for every application, deployed containers can be routed dynamically through Traefik.

```text
                    Incoming Request
                           │
                           ▼
                      ┌─────────┐
                      │ Traefik │
                      └────┬────┘
                           │
                    Host-based Routing
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       app1.example.com          app2.example.com
              │                         │
              ▼                         ▼
       Docker Container A        Docker Container B
```

This allows multiple applications to run on the same server while remaining accessible through separate hostnames.

### Why Traefik?

- Dynamic service discovery
- Host-based routing
- Docker integration
- No manual proxy configuration per deployment
- Supports multiple applications on the same server
- Simplifies routing as new deployments are added

---

## 🧩 Repository Structure

DeployServers is implemented as three separate repositories.

### Frontend — DeployServers

The React frontend provides the user interface for authentication, repository selection, project management, and deployment information.

**Repository:**  
https://github.com/Raghavnadiminti/DeployServers

---

### Backend — deployServers_backend

The backend acts as the central API and integration layer.

**Responsibilities:**

- GitHub OAuth
- JWT authentication
- GitHub API integration
- Repository retrieval
- Project creation and management
- Webhook registration
- Webhook validation
- Deployment job creation
- MongoDB data management

**Repository:**  
https://github.com/Raghavnadiminti/deployServers_backend

---

### Worker — deployservers_worker

The worker is an independent background service responsible for executing deployment jobs.

**Responsibilities:**

- Consume BullMQ jobs
- Clone repositories
- Build applications
- Create and manage Docker containers
- Execute deployment operations
- Handle deployment failures and retries
- Update deployment state

**Repository:**  
https://github.com/Raghavnadiminti/deployservers_worker

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express |
| Authentication | GitHub OAuth, JWT |
| Database | MongoDB |
| ODM | Mongoose |
| Queue | BullMQ |
| Message Broker | Redis |
| Git Integration | GitHub API |
| Events | GitHub Webhooks |
| HTTP Client | Axios |
| Containerization | Docker |
| Reverse Proxy | Traefik |
| Infrastructure | AWS EC2 |

---

## 📁 Project Structure

### Frontend

```text
DeployServers/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── ...
├── public/
├── package.json
└── vite.config.*
```

### Backend

```text
deployServers_backend/
├── config/
├── middlewares/
├── models/
├── routes/
├── index.js
└── package.json
```

### Worker

```text
deployservers_worker/
├── Queue/
├── controllers/
├── models/
├── routes/
├── config/
├── index.js
└── package.json
```

---

## ⚙️ Running Locally

Clone all three repositories:

```bash
git clone https://github.com/Raghavnadiminti/DeployServers.git
git clone https://github.com/Raghavnadiminti/deployServers_backend.git
git clone https://github.com/Raghavnadiminti/deployservers_worker.git
```

### Frontend

```bash
cd DeployServers
npm install
npm run dev
```

### Backend

```bash
cd deployServers_backend
npm install
npm start
```

### Worker

```bash
cd deployservers_worker
npm install
npm start
```

---

## 🔐 Environment Variables

Configure the required environment variables for the backend and worker.

Example:

```env
PORT=
MONGO_URI=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

JWT_SECRET=

BASE_URL=
```

> Never commit credentials, API keys, access tokens, or private secrets to Git.

---

## 🧠 Engineering Concepts

DeployServers demonstrates practical implementation of:

- Distributed service architecture
- REST API design
- GitHub OAuth
- JWT authentication
- HTTP-only cookies
- GitHub API integration
- Webhook-driven automation
- HMAC signature verification
- Event-driven deployment
- Asynchronous job processing
- Redis-backed queues
- BullMQ workers
- MongoDB data modeling
- Docker containerization
- Dynamic reverse proxying with Traefik
- Host-based routing
- Background processing
- Retry and failure handling
- Service separation

---

## 🎯 Key Design Decisions

### Background Worker

Deployment can involve long-running operations such as cloning repositories, installing dependencies, building applications, and starting containers.

The backend therefore delegates deployment work to a background worker.

```text
API Request
    │
    ▼
Create Deployment Job
    │
    ▼
Return Response
    │
    └──────────────► Worker processes deployment
```

This prevents long-running deployment tasks from blocking API requests.

---

### Redis + BullMQ

Redis provides the queue backend while BullMQ provides job management and worker processing.

This enables:

- Asynchronous execution
- Job persistence
- Retry handling
- Background processing
- Separation between API and deployment workloads

---

### GitHub Webhooks

Polling GitHub for repository changes would introduce unnecessary repeated requests.

Webhooks allow DeployServers to react to repository changes immediately.

```text
Code Push
   │
   ▼
GitHub
   │
   ▼
Webhook
   │
   ▼
Backend
   │
   ▼
Deployment Queue
```

---

### Traefik Reverse Proxy

Traefik provides dynamic routing between incoming requests and deployed Docker containers.

```text
Request
   │
   ▼
Traefik
   │
   ├── app1.example.com ──► Container 1
   │
   ├── app2.example.com ──► Container 2
   │
   └── app3.example.com ──► Container 3
```

This avoids maintaining separate manual reverse-proxy configurations as applications are deployed.

---

## 🔮 Future Improvements

- 📜 Deployment logs
- 📡 Real-time log streaming
- 🕐 Deployment history
- ↩️ Rollbacks
- 🌐 Custom domains
- 🔒 Automated HTTPS
- ❤️ Deployment health checks
- 💾 Build caching
- 📈 Monitoring and metrics
- 👷 Multiple worker instances
- 📊 Worker load balancing
- ☁️ Multi-server deployment
- 📦 Resource limits per container

---

## 🔗 Repositories

| Service | Repository |
|---|---|
| Frontend | https://github.com/Raghavnadiminti/DeployServers |
| Backend | https://github.com/Raghavnadiminti/deployServers_backend |
| Worker | https://github.com/Raghavnadiminti/deployservers_worker |

---

## 👨‍💻 Author

**Raghavendra Nadiminti**

Computer Science Engineering Student | Software Engineer

GitHub:  
https://github.com/Raghavnadiminti
