# Pocket C.A. — Pocket Chartered Accountant

An AI-powered chatbot that explains basic **Accounting and Finance** concepts in simple,
beginner-friendly language. Built as a full-stack final-year capstone project.

> Pocket C.A. provides educational guidance only — it is not a substitute for professional
> financial, tax, or legal advice.

---

## ✨ What it does

- Single-page chat interface (no dashboard, no admin panel, no file uploads — just chat).
- Answers **only** Accounting & Finance questions (GST, TDS, Bookkeeping, Balance Sheet,
  Journal Entries, Budgeting, Compound Interest, and more), politely redirecting anything
  off-topic.
- Every answer follows a consistent 5-part structure: **Simple Explanation → Real-life
  Example → Why it Matters → Key Points to Remember → Related Questions**.
- JWT authentication, per-user conversation history, pin/search/delete chats.
- Clean separation between the mock AI logic and everything else, so a real LLM
  (OpenAI-compatible, Claude, Gemini, etc.) can be dropped in later with minimal changes.

---

## 🧱 Tech stack

| Layer     | Stack |
|-----------|-------|
| Frontend  | React + Vite + TypeScript + Tailwind CSS + shadcn-style UI primitives + Framer Motion + Lucide React + React Markdown + Axios |
| Backend   | Node.js + Express + TypeScript + MongoDB + Mongoose + JWT + bcrypt + Helmet + CORS + Morgan + express-validator |

---

## 📁 Project structure

```
pocket-ca/
├── backend/
│   ├── src/
│   │   ├── config/        # env loader
│   │   ├── controllers/   # request handlers
│   │   ├── database/      # mongoose connection
│   │   ├── middleware/    # auth, validation, error handling
│   │   ├── models/        # User, Conversation, Message
│   │   ├── repositories/  # DB access, isolated from services
│   │   ├── routes/        # /api/auth, /api/chat
│   │   ├── services/      # auth.service, chat.service, ai.service (AI logic lives here ONLY)
│   │   ├── types/         # shared TS types
│   │   ├── utils/         # ApiError, ApiResponse, asyncHandler, jwt, logger
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/       # AuthGate (login/register)
    │   │   ├── chat/       # Header, ChatContainer, ChatBubble, ChatInput,
    │   │   │                 SuggestedQuestion, TypingIndicator, Loader, MarkdownRenderer, EmptyState
    │   │   ├── layout/     # Sidebar, AppShell
    │   │   └── ui/         # Button, Input, Textarea, Logo (shadcn-style primitives)
    │   ├── hooks/          # useAuth, useChat, useAutoResizeTextarea
    │   ├── services/       # axios instance + auth/chat API calls
    │   ├── types/          # shared TS types
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Backend

```bash
cd backend
cp .env.example .env     # then edit MONGODB_URI / JWT_SECRET as needed
npm install
npm run dev               # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_BASE_URL defaults to http://localhost:5000/api
npm install
npm run dev               # starts on http://localhost:5173
```

Open `http://localhost:5173`, create an account, and start chatting.

---

## 🔌 API reference

| Method | Endpoint             | Auth | Description |
|--------|-----------------------|------|--------------|
| POST   | `/api/auth/register`  | No   | Create an account |
| POST   | `/api/auth/login`     | No   | Log in, get a JWT |
| POST   | `/api/chat`           | Yes  | Send a question (creates a conversation if `conversationId` is omitted) |
| GET    | `/api/chat/history`   | Yes  | List the user's conversations |
| GET    | `/api/chat/:id`       | Yes  | Get a conversation + its messages |
| DELETE | `/api/chat/:id`       | Yes  | Delete a conversation |

Authenticated requests need `Authorization: Bearer <token>`.

---

## 🔮 Swapping in a real LLM

All AI logic lives in **`backend/src/services/ai.service.ts`**, behind a single function:

```ts
generateReply(question: string): Promise<{ content: string; isOnTopic: boolean }>
```

To connect a real model, replace the body of `generateReply` with a call to your provider
of choice (keeping the system prompt guidance at the top of the file so the assistant stays
scoped to Accounting & Finance and keeps the 5-part answer format). Nothing in the
controllers, routes, or repositories needs to change.

---

## 🎨 Design notes

The UI uses an original blue → teal brand gradient, a soft off-white canvas, and a
persistent sidebar for chat history (pinned + recent), styled independently from any
existing AI chat product while following the same familiar chat-app conventions
(sidebar + message thread + composer) users already know.
