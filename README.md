# 🚀 Enterprise AI Knowledge Management Platform

> A full-stack app where a company can upload its documents and let its team ask an AI questions about them. The AI only answers using the company's own documents, and it shows where each answer came from.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.139-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-blue)
![Redis](https://img.shields.io/badge/Redis-Caching-red)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![License](https://img.shields.io/badge/License-MIT-orange)

**🔗 Live Demo:** [enterprise-rag-platform-three.vercel.app](https://enterprise-rag-platform-three.vercel.app)

📸 Screenshots are in the [`/screenshot`](./screenshot) folder.

---

## 📖 What This Project Does

Every company that signs up gets its own private space. They can:

1. Upload PDF files.
2. The app reads the PDFs, breaks them into small pieces, and turns each piece into a set of numbers (an "embedding") that captures its meaning.
3. When a user asks a question, the app finds the pieces of text that are closest in meaning to the question.
4. Those pieces are sent to an AI model along with the question, so the AI can give an answer based on the real documents — not just guessing.
5. The answer is shown along with the source document, so the user can check it.

Everything is kept separate between companies. One company can never see another company's documents, users, or chats.

---

## ✨ Main Features

- **Login and roles** — users log in with a password (JWT tokens), and there are two roles: admin and employee.
- **Multi-company support** — each company's data (users, documents, chats) is fully separated from every other company.
- **Document upload** — upload PDFs, and the app processes them in the background so the upload feels instant.
- **AI chat with sources** — ask questions and get answers with the exact document and section they came from.
- **Multiple AI providers** — the app tries Gemini first, then Groq, then DeepSeek, so it keeps working even if one AI service is down.
- **Fast repeated answers** — if the same question is asked again, the answer is cached in Redis so it comes back instantly.
- **Team management** — an admin can add, update, or remove users in their company.
- **Account settings** — users can update their profile and change their password.

---

## 🛠️ Tech Stack

| Layer | What's used |
|---|---|
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL (with the pgvector add-on for search), Redis |
| Frontend | React, Vite, React Router, Tailwind CSS, React Hook Form |
| AI / ML | Voyage AI (for embeddings), Gemini, Groq, DeepSeek (for answers) |
| Security | JWT tokens, bcrypt password hashing |
| DevOps | Docker, Docker Compose |

---

## 🔄 How a Question Gets Answered

```text
1. User uploads a PDF
2. App reads the text and splits it into small chunks
3. Each chunk is turned into an embedding and saved in the database

4. User asks a question
5. The question is also turned into an embedding
6. The app finds the closest matching chunks
7. Those chunks + the question are sent to the AI
8. The AI writes an answer, and it's shown with its sources
9. The answer is saved so the same question is instant next time
```

---

## 📂 Project Structure

```text
enterprise-rag-platform/
├── backend/
│   ├── core/        # login/security code
│   ├── crud/        # database read/write functions
│   ├── models/       # database tables
│   ├── router/       # API endpoints
│   ├── schemas/       # request/response shapes
│   ├── services/       # main logic (AI, chat, document processing)
│   └── app.py
├── frontend/
│   └── src/
│       ├── components/  # reusable UI pieces
│       ├── pages/        # each screen (login, dashboard, chat, etc.)
│       ├── routes/
│       └── services/    # calls to the backend API
├── screenshots/
└── docker-compose.yml
```

---

## 📡 API Endpoints

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Users | `POST/GET /users`, `GET/PUT/DELETE /users/{id}`, `PUT /users/change-password` |
| Organizations | `POST/GET /organizations`, `PUT/DELETE /organizations/{id}` |
| Documents | `POST /documents/upload`, `GET /documents`, `GET/DELETE /documents/{id}` |
| Chat | `POST /chat`, `POST /chat/stream`, `GET /chat/sessions`, `GET/DELETE /chat/sessions/{id}` |

---

## 🚀 Running It Yourself

```bash
git clone https://github.com/Imteyaz-428/enterprise-rag-platform.git
cd enterprise-rag-platform

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload

# Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev

# Or start the backend, database, and Redis all at once with Docker
docker compose up --build
```

Create a `.env` file inside `backend/`:

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

## 📊 Project Status

**Done:**
- Login, roles, and per-company data separation
- PDF upload and background processing
- AI chat with source citations
- Backup AI providers (Gemini → Groq → DeepSeek)
- Redis caching for faster repeat answers
- Team and account management pages
- Docker setup

**Working on next:**
- Automated tests
- CI/CD (auto-deploy on every code push)
- Rate limiting (to stop API abuse)
- Better logging and monitoring
- Kubernetes deployment

---

## 📚 What I Learned Building This

- How to build a real backend API with FastAPI
- How to keep multiple companies' data separate and secure in one app
- How login tokens (JWT) and password hashing work
- How to turn text into embeddings and search by meaning (not just keywords)
- How to build a RAG system — the same idea behind tools like ChatGPT's document Q&A
- How to fall back between different AI providers if one fails
- How to use Redis to cache results and speed things up
- How to connect a React frontend to a FastAPI backend

---

## 👨‍💻 Author

**Imteyaz Alam** — B.Tech, AI & Machine Learning
[GitHub](https://github.com/Imteyaz-428) · [LinkedIn](https://linkedin.com/in/imteyaz428)

If you find this project useful, a ⭐ on GitHub would mean a lot.