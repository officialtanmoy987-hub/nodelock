# Running CRIMEGRAPH AI

## Prerequisites

- Python 3.10 or newer
- Node.js 20 or newer

## 1. Start the API

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python backend\run.py
```

Expected output includes Uvicorn listening on `http://127.0.0.1:8000`. The server writes deterministic `demo_*.json` files to `data/demo/` at startup.

Quick check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
Invoke-RestMethod http://127.0.0.1:8000/api/dashboard
```

## 2. Start the frontend

In a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`.

## 3. Production frontend verification

```powershell
cd frontend
npm.cmd run build
```

The static build is written to `frontend/dist/` and is intentionally ignored by Git.

## API highlights

- `GET /api/dashboard` — metrics, ranking, activity and alerts
- `GET /api/network` — graph nodes/edges
- `GET /api/people/P001` — demo subject profile
- `GET /api/path?source=P001&target=P013` — shortest analytical path
- `POST /api/nlp/extract` — rule-based note extraction
- `POST /api/investigate` — JSON intelligence report
- `POST /api/import` — non-persisting import preview

Interactive OpenAPI documentation is at `http://127.0.0.1:8000/docs`.

## Important

The app runs with fictional demo data. It must not be used to assess real people or make claims of criminality.
