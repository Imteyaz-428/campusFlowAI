# 🚀 Enterprise AI Knowledge Management Platform

> A production-ready, full-stack Retrieval-Augmented Generation (RAG) platform that enables organizations to securely upload documents, perform semantic search, and interact with their private knowledge base using AI-powered conversations.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.139-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-blue)
![Redis](https://img.shields.io/badge/Redis-Caching-red)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![License](https://img.shields.io/badge/License-MIT-orange)

---

# 📖 Overview

The **Enterprise AI Knowledge Management Platform** is a production-oriented, multi-tenant AI application built with **FastAPI**, **React**, **PostgreSQL**, **pgvector**, and **Redis**.

Organizations can upload PDF documents, automatically extract and embed their contents, and interact with their private knowledge base through an AI-powered chat interface. Every response is generated using Retrieval-Augmented Generation (RAG), ensuring answers are grounded in the organization's own documents rather than relying solely on the language model.

The project follows enterprise software engineering practices including:

- Multi-Tenant Architecture
- Role-Based Access Control (RBAC)
- Service Layer Architecture
- Provider Pattern
- Background Document Processing
- Retrieval-Augmented Generation (RAG)
- Semantic Search using pgvector
- Streaming AI Responses (SSE)
- Redis Response Caching

---

# ✨ Features

## 🔐 Authentication & Security

- JWT Authentication (OAuth2 Password Flow)
- Password hashing using bcrypt
- Role-Based Access Control (Admin / Employee)
- Organization-scoped authorization
- Secure password update
- User profile management
- Environment-based secret management

---

## 🏢 Multi-Tenant Architecture

- Organization management
- Organization-scoped users
- Organization-scoped documents
- Organization-scoped chat sessions
- Complete tenant isolation
- Protected API endpoints

---

## 📄 Document Management

- PDF upload
- Drag & Drop upload interface
- Multiple file upload
- File validation
- Background document processing
- Automatic text extraction
- Chunk generation
- Embedding generation
- Document status tracking
- Document search
- Pagination
- Delete documents

---

## 🤖 AI & Retrieval-Augmented Generation

- Semantic Search
- Vector Similarity Search
- Multi-document Retrieval
- Prompt Builder
- Conversation History
- AI-powered Knowledge Base
- Streaming AI Responses
- Source-aware Retrieval
- Automatic Retry Logic
- Multi-provider AI Fallback

Supported AI Providers:

- Gemini
- Groq
- DeepSeek

---

## 💬 AI Chat

- Real-time AI conversations
- Streaming responses
- Chat history
- Persistent chat sessions
- Automatic session titles
- Multiple chat sessions
- Session management
- Enterprise chat interface

---

## 👥 Team Management

- Organization users
- Admin dashboard
- Create users
- Update users
- Delete users
- Role management

---

## ⚙️ Account Settings

- Profile management
- Update profile
- Change password
- Secure account settings

---

## ⚡ Performance

- Redis caching
- Background Tasks
- Fast document processing
- Async API endpoints
- Optimized semantic search
- Streaming responses

---

# 🛠️ Tech Stack

## Backend

- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- pgvector
- Redis
- Pydantic v2

---

## Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- Lucide React

---

## AI / ML

- Voyage AI Embeddings
- Gemini
- Groq
- DeepSeek
- PyMuPDF

---

## Security

- JWT Authentication
- OAuth2 Password Flow
- bcrypt
- passlib
- python-jose

---

## DevOps

- Docker
- Docker Compose
- PostgreSQL Container
- Redis Container

**Upcoming**

- Kubernetes
- CI/CD
- Monitoring

---

# 📸 Application Screenshots

> Screenshots will be added after deployment.

### Dashboard

<!-- Add dashboard screenshot -->

### Upload Documents

<!-- Add upload screenshot -->

### Documents

<!-- Add documents screenshot -->

### AI Chat

<!-- Add chat screenshot -->

### Team Management

<!-- Add team screenshot -->

### Settings

<!-- Add settings screenshot -->

---

# 🏗️ System Architecture

```text
                        React Frontend
                               │
                               ▼
                     JWT Authentication
                               │
                               ▼
                        FastAPI Backend
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     User Service        Document Service      Chat Service
                               │
                               ▼
                      Retrieval Service
                               │
                               ▼
                       Prompt Builder
                               │
                               ▼
                          AI Service
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
       Gemini               Groq              DeepSeek
                               │
                               ▼
                     Generated AI Response
```

---

# 🔄 RAG Pipeline

```text
                    Upload PDF
                        │
                        ▼
                 Validate Document
                        │
                        ▼
             Store PDF in Upload Folder
                        │
                        ▼
           Background Document Processing
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
  Extract Text     Chunk Document   Generate Embeddings
                        │
                        ▼
             Store Chunks + Embeddings
                 PostgreSQL + pgvector
                        │
                        ▼
               User Asks a Question
                        │
                        ▼
             Generate Query Embedding
                        │
                        ▼
           Semantic Vector Similarity Search
                        │
                        ▼
             Retrieve Relevant Chunks
                        │
                        ▼
            Build Prompt + Chat History
                        │
                        ▼
               AI Provider Selection
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
      Gemini          Groq          DeepSeek
                        │
                        ▼
              Generate Final Response
                        │
                        ▼
              Cache Result in Redis
                        │
                        ▼
         Stream Response to React Frontend
```

---

# 📂 Project Structure

```text
enterprise-rag-platform/
│
├── backend/
│   ├── core/
│   ├── crud/
│   ├── models/
│   ├── router/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   └── app.py
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── App.jsx
│
├── docker-compose.yml
├── README.md
└── requirements.txt
```

---

# 🖥️ Frontend

The React frontend provides a clean enterprise dashboard for managing documents, users, and AI conversations.

### Features

- Login & Authentication
- Dashboard
- Upload Documents
- Document Management
- AI Chat
- Team Management
- Account Settings
- Responsive Layout

---

# ⚙️ Backend

The FastAPI backend handles authentication, document processing, vector search, and AI orchestration.

### Features

- JWT Authentication
- RBAC
- Multi-Tenant Architecture
- Background Document Processing
- Semantic Search
- RAG Pipeline
- Redis Caching
- Streaming Chat API

---

# 📡 Main API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/users/login` |
| GET | `/users/me` |

---

## Users

| Method | Endpoint |
|---------|----------|
| POST | `/users` |
| GET | `/users` |
| GET | `/users/{id}` |
| PUT | `/users/{id}` |
| DELETE | `/users/{id}` |

---

## Organizations

| Method | Endpoint |
|---------|----------|
| POST | `/organizations` |
| GET | `/organizations` |
| PUT | `/organizations/{id}` |
| DELETE | `/organizations/{id}` |

---

## Documents

| Method | Endpoint |
|---------|----------|
| POST | `/documents/upload` |
| GET | `/documents` |
| GET | `/documents/{id}` |
| DELETE | `/documents/{id}` |

---

## Chat

| Method | Endpoint |
|---------|----------|
| POST | `/chat` |
| POST | `/chat/stream` |
| GET | `/chat/sessions` |
| GET | `/chat/sessions/{id}` |
| DELETE | `/chat/sessions/{id}` |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Imteyaz-428/enterprise-rag-platform.git

cd enterprise-rag-platform
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

uvicorn app:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Docker

```bash
docker compose up --build
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=

SECRET_KEY=

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=180

VOYAGE_API_KEY=

GEMINI_API_KEY=

GROQ_API_KEY=

DEEPSEEK_API_KEY=

REDIS_HOST=localhost

REDIS_PORT=6379
```

---

# 🔄 Project Workflow

```text
Login
   │
   ▼
Upload PDF
   │
   ▼
Extract Text
   │
   ▼
Chunk Document
   │
   ▼
Generate Embeddings
   │
   ▼
Store in pgvector
   │
   ▼
Ask Question
   │
   ▼
Semantic Search
   │
   ▼
Retrieve Context
   │
   ▼
Generate AI Response
   │
   ▼
Display Answer
```

---

# 🎯 Current Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control
- ✅ Multi-Tenant Architecture
- ✅ PDF Upload
- ✅ Background Processing
- ✅ Semantic Search
- ✅ pgvector Integration
- ✅ Redis Caching
- ✅ Streaming AI Chat
- ✅ Chat History
- ✅ User Management
- ✅ Team Management
- ✅ Account Settings
- ✅ Document Management
- ✅ Enterprise Dashboard


# 📊 Project Status

## ✅ Completed

### Backend
- JWT Authentication
- Role-Based Access Control (RBAC)
- Multi-Tenant Architecture
- Organization Management
- User Management
- Document Upload & Processing
- Semantic Search with pgvector
- Retrieval-Augmented Generation (RAG)
- Multi-Provider AI (Gemini, Groq, DeepSeek)
- Background Tasks
- Redis Caching
- Streaming AI Responses
- Chat Session Management

### Frontend
- Authentication
- Dashboard
- Upload Documents
- Document Management
- AI Chat
- Team Management
- Account Settings
- Profile Update
- Password Change

### DevOps
- Docker
- Docker Compose

---

# 🗺️ Roadmap

## ✅ Completed

- Authentication & Authorization
- Multi-Tenant Architecture
- Document Processing Pipeline
- Semantic Search
- AI Chat
- Enterprise Dashboard
- Docker Support

## 🚧 In Progress

- Kubernetes Deployment
- CI/CD Pipeline
- Source Citations
- Document Preview

## 📌 Planned

- Hybrid Search
- Monitoring & Logging
- Automated Testing
- Rate Limiting
- AI Analytics Dashboard

---

# 📚 What I Learned

This project helped me gain practical experience with:

- Building production-ready REST APIs using FastAPI
- Designing Multi-Tenant Architectures
- Implementing JWT Authentication & RBAC
- Working with PostgreSQL and pgvector
- Building Retrieval-Augmented Generation (RAG) systems
- Semantic Search and Vector Embeddings
- Integrating multiple LLM providers
- Background Task Processing
- Redis Caching
- Docker-based development
- Building a full-stack application with React and FastAPI

---

# 💡 Future Improvements

- Kubernetes Deployment
- GitHub Actions CI/CD
- Source Citation Viewer
- PDF Preview
- Hybrid Search (Vector + Keyword)
- Observability & Monitoring
- Unit & Integration Tests

---

# 🤝 Contributing

Contributions, suggestions, and feedback are always welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Imteyaz Alam**

B.Tech – Artificial Intelligence & Machine Learning

### Connect with me

- GitHub: https://github.com/Imteyaz-428
- LinkedIn: https://linkedin.com/in/imteyaz428

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates me to continue improving it.