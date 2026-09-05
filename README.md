# FurniLedger

A starter full-stack application with a React frontend and an Express backend.

## Structure

- `frontend`: Vite + React application on port 5173
- `backend`: Express API on port 5000

## Install

```powershell
cd frontend
npm install
cd ..\backend
npm install
```

## Connect Supabase

Copy `frontend/.env.example` to `frontend/.env` and fill in the Supabase project URL and publishable key from the Supabase dashboard under Project Settings > API. The SQL files in `supabase/migrations` must be applied to the same project before creating users.

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to the Supabase PostgreSQL connection string from Project Settings > Database. The backend uses Prisma and verifies this connection through `GET /api/health`.

Never put a Supabase service-role key in the frontend. The publishable key is intended for browser use and database access is restricted by the project's row-level security policies.

## Run

Open two terminals from the project root.

```powershell
cd backend
npm run dev  OR  npm start
```

```powershell
cd frontend
npm run dev  OR  npm start
```

Then open http://localhost:5173. The page checks the backend at `/api/md` through the Vite development proxy.
