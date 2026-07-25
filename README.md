# SafeSheet AI — Chemical Safety Platform

AI-powered SDS/MSDS generation, management, compliance auditing, SOP generation, and worker chatbot. Built with Next.js 14, Express.js, Supabase, OpenAI GPT-4o, and Anthropic Claude.

---

## Project structure

```
safesheet-ai/
├── frontend/    ← Next.js 14 App Router (port 3000)
└── backend/     ← Node.js + Express.js API (port 5000)
```

---

## Quick start

### 1. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
```

### 2. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

### 3. Supabase database

Create these tables in your Supabase project:

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'ehs_manager',
  email_verified boolean default false,
  company text,
  phone text,
  job_title text,
  preferred_language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Refresh tokens
create table refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

-- OTP codes
create table otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  code_hash text not null,
  purpose text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- SDS documents
create table sds_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  chemical_name text not null,
  cas_number text,
  formula text,
  product_code text,
  language text default 'en',
  jurisdiction text default 'US_OSHA',
  sections jsonb default '{}',
  status text default 'draft',
  version int default 1,
  compliance_score int,
  source_file text,
  extraction_confidence int,
  ai_model text,
  tokens_used int,
  approved_by uuid references users(id),
  approved_at timestamptz,
  expires_at timestamptz,
  last_audited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SDS versions
create table sds_versions (
  id uuid primary key default gen_random_uuid(),
  sds_id uuid references sds_documents(id) on delete cascade,
  version int not null,
  sections jsonb default '{}',
  changed_by uuid references users(id),
  change_summary text,
  created_at timestamptz default now()
);

-- SOP documents
create table sop_documents (
  id uuid primary key default gen_random_uuid(),
  sds_id uuid references sds_documents(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  language text not null,
  type text not null,
  title text,
  content jsonb default '{}',
  is_rtl boolean default false,
  status text default 'draft',
  version int default 1,
  ai_model text,
  tokens_used int,
  approved_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Compliance audits
create table compliance_audits (
  id uuid primary key default gen_random_uuid(),
  sds_id uuid references sds_documents(id) on delete cascade,
  jurisdiction text not null,
  score int,
  gaps jsonb default '[]',
  run_by uuid references users(id),
  created_at timestamptz default now()
);

-- Chat sessions
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  sds_id uuid references sds_documents(id) on delete cascade,
  title text default 'SDS Chat',
  created_at timestamptz default now()
);

-- Chat messages
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  tokens_used int default 0,
  created_at timestamptz default now()
);
```

---

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Sign in |
| POST | `/api/v1/auth/logout` | Sign out |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Send OTP reset code |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| POST | `/api/v1/auth/reset-password` | Set new password |
| POST | `/api/v1/auth/change-password` | Change password (logged in) |
| GET  | `/api/v1/auth/verify-email` | Verify email from link |
| POST | `/api/v1/auth/resend-verify` | Resend verification email |
| POST | `/api/v1/sds/generate` | AI SDS generation |
| POST | `/api/v1/sds/upload` | Upload + extract SDS |
| GET  | `/api/v1/sds` | List SDS library |
| GET  | `/api/v1/sds/:id` | Get SDS detail |
| PUT  | `/api/v1/sds/:id` | Update SDS |
| DELETE | `/api/v1/sds/:id` | Delete SDS |
| POST | `/api/v1/sds/:id/approve` | Approve SDS |
| GET  | `/api/v1/sds/:id/export` | Export PDF |
| POST | `/api/v1/sop/generate` | AI SOP generation |
| GET  | `/api/v1/sop` | List SOPs |
| GET  | `/api/v1/sop/:id/export` | Export SOP PDF |
| POST | `/api/v1/compliance/audit/:id` | Audit single SDS |
| POST | `/api/v1/compliance/audit-library` | Audit all SDS |
| POST | `/api/v1/chat/message` | Send chatbot message |
| GET  | `/api/v1/chat/history/:sdsId` | Get chat history |

---

## AI providers

| Task | Provider | Model |
|------|----------|-------|
| SDS generation | Anthropic | claude-opus-4-6 |
| SOP generation | Anthropic | claude-opus-4-6 |
| Compliance audit | Anthropic | claude-opus-4-6 |
| Document extraction | Anthropic | claude-opus-4-6 |
| SDS chatbot Q&A | OpenAI | gpt-4o |

---

## Features

- **AI SDS generation** — 16-section GHS SDS from formula/CAS in ~60 seconds
- **Document upload** — PDF/DOCX/image import with AI extraction
- **Compliance auditing** — Rule-based + AI gap detection with one-click fixes
- **SOP generator** — Step-by-step procedures in 16+ languages including Arabic RTL
- **SDS chatbot** — GPT-4o powered Q&A grounded in SDS content
- **GHS library** — Searchable, version-controlled SDS management
- **Multi-language** — Full Arabic RTL support throughout UI and documents
- **Multi-jurisdiction** — US OSHA, EU CLP, UK HSE, AU WHS, Saudi SASO, and more
