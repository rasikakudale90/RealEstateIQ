# RealEstateIQ 🏡

> **Real Estate Price Prediction Using Machine Learning**  
> An enterprise-grade, full-stack application providing residential property price estimates powered by a scikit-learn regression pipeline, FastAPI, Next.js, and Supabase.

---

## 📌 Disclaimer
**RealEstateIQ is an estimation aid, not a formal appraisal, certified valuation, or guarantee of a property's actual transaction price.** All estimates should be considered indicative.

---

## 🏗️ Architecture & Technology Stack

The project is structured as a unified monorepo designed for cost-effective deployment across modern cloud platforms:

* **Frontend (`frontend/`):** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons — Deployed on **Vercel**.
* **Backend API (`backend/`):** Python 3.13+, FastAPI, Pydantic, Uvicorn — Deployed on **Render**.
* **Machine Learning (`ml/`):** scikit-learn, Pandas, NumPy, Joblib pipeline serialization.
* **Database & Auth (`supabase/`):** Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth.
* **Continuous Integration & Testing:** Pytest, HTTPX, Jest/React Testing Library.

```text
Browser / Client
      │
      ▼
Next.js Frontend (Vercel)
      │
      ▼ HTTPS
FastAPI Backend (Render)
 ├── ML Inference Service (Loaded scikit-learn Pipeline)
 └── Supabase Client (Auth Verification & PostgreSQL Persistence)
```

---

## 🔒 100% Environment-Driven Configuration

This repository strictly complies with zero-credential commitment policies:
* **No hardcoded secrets or environment variables exist in code or commits.**
* All runtime variables are declared via `.env.example` templates and loaded dynamically through:
  * Backend: `pydantic-settings.BaseSettings`
  * Frontend: `process.env.*`
* Never commit `.env` or sensitive credentials to source control.

---

## 📂 Repository Layout

```text
realestateiq/
├── frontend/                   # Next.js App Router, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/                # Pages and layouts (Landing, Predict, History, Admin, Auth)
│   │   ├── components/         # Reusable UI components (Navbar, etc.)
│   │   ├── lib/                # API client, Supabase client, Auth context
│   │   └── types/              # TypeScript definitions
│   ├── .env.example            # Frontend environment template
│   └── package.json
├── backend/                    # FastAPI REST API & Inference Service
│   ├── app/
│   │   ├── api/routes/         # Route endpoints (health, predict, admin, profile)
│   │   ├── core/               # Env-driven configuration & security
│   │   ├── db/                 # Supabase client & repository helpers
│   │   ├── schemas/            # Pydantic schemas (property, user, admin)
│   │   ├── services/           # Business logic & prediction service
│   │   └── main.py             # FastAPI entrypoint
│   ├── .env.example            # Backend environment template
│   ├── Dockerfile              # Production container definition for Render
│   ├── Procfile                # Render web service procfile
│   └── requirements.txt
├── ml/                         # Machine learning package
│   ├── training/               # Offline training pipelines & experiments
│   │   ├── data/               # Raw and processed datasets (gitignored)
│   │   └── scripts/            # Training and evaluation scripts
│   ├── inference/              # Production inference runtime
│   │   ├── artifacts/          # Serialized pipeline (.joblib) & metadata (.json)
│   │   └── model/              # Singleton pipeline loader and predictor
│   └── README.md
├── supabase/                   # Database schemas & migrations
│   └── migrations/             # SQL migrations for profiles, predictions, RLS
├── tests/                      # Automated test suite
│   ├── backend/                # API and endpoint tests (test_api, test_health, test_boundaries)
│   └── ml/                     # Model pipeline and reload tests (test_pipeline)
├── docs/                       # Specifications and requirements
│   └── RealEstateIQ_SRS.md     # Official Software Requirements Specification
├── render.yaml                 # Render infrastructure deployment blueprint
├── .gitignore
├── AGENTS.md                   # Agent guidelines and workflows
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
* Python 3.13+ or Python 3.14
* Node.js 18+ and npm 10+
* Git

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Configure local environment variables
uvicorn app.main:app --reload --port 8000
```
API documentation is accessible at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local # Configure local environment variables
npm run dev
```
The web application is accessible at `http://localhost:3000`.

---

## 🧪 Testing

Run all 18 automated backend and ML pipeline unit/integration tests:
```bash
pytest tests/ -v
```

Verify frontend compilation and static prerendering:
```bash
cd frontend && npm run build
```

---

## ☁️ Cloud Deployment Guide

### 1. Supabase (Database & Authentication)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`.
3. Obtain your Project URL, public `anon` key, and `service_role` key from **Project Settings > API**.

### 2. Render (FastAPI & ML Inference Service)
1. Create a new **Web Service** on Render connected to `https://github.com/rasikakudale90/RealEstateIQ.git`.
2. Select **Docker** environment (or use `render.yaml`).
3. Set the Docker Context to root `.` and Dockerfile path to `./backend/Dockerfile`.
4. Configure Environment Variables:
   * `FRONTEND_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   * `SUPABASE_URL`: Your Supabase URL
   * `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   * `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   * `MODEL_ARTIFACT_PATH`: `ml/inference/artifacts/house_price_pipeline.joblib`
   * `MODEL_METADATA_PATH`: `ml/inference/artifacts/model_metadata.json`
   * `TARGET_CURRENCY`: `INR`
5. The service will expose `/health` and `/ready` probes.

### 3. Vercel (Next.js Web Frontend)
1. Import repository to Vercel and specify the Root Directory as `frontend`.
2. Configure Environment Variables in Vercel project settings:
   * `NEXT_PUBLIC_API_BASE_URL`: Deployed Render API URL (e.g. `https://realestateiq-api.onrender.com`)
   * `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Public Key
3. Deploy!
