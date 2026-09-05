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

## Run

Open two terminals from the project root.

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Then open http://localhost:5173. The page checks the backend at `/api/health` through the Vite development proxy.
