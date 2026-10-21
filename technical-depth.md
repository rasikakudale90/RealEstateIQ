# RealEstateIQ — Technical Depth & Architecture Document

> **Author:** Antigravity AI Engineering  
> **Target Audience:** Engineering Team & Technical Stakeholders  
> **Version:** 1.0.0  
> **Status:** Production-Ready Backend, ML, & Data Pipeline | Frontend UI Staged for `design.md`

---

## 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Client / Web Browser                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js 14+ Frontend (Hosted on Vercel)            │
│  - App Router, TypeScript, Tailwind CSS, Lucide Icons           │
│  - Auth Context (Supabase Auth Client + Local Demo Sandbox)     │
│  - Environment-Driven API Client                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │ JSON / REST over HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              FastAPI Backend API (Hosted on Render)             │
│  - 100% Environment-Driven Configuration (pydantic-settings)    │
│  - Server-Side JWT Verification & Role Authorization            │
│  - Pydantic Validation Schemas with Strict Boundary Checks     │
│  - Prediction, History, Profile, and Admin Endpoints            │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│      ML Inference Engine      │ │      Data Access Layer        │
│  - house_price_pipeline.joblib│ │  - Supabase PostgreSQL (RLS)  │
│  - Random Forest Regressor    │ │  - Thread-Safe Local Store    │
│  - ColumnTransformer Pipelines│ │  - PostgREST REST Integration │
│  - Cached Singleton Loader    │ │  - profiles & predictions     │
└───────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Machine Learning Regression Pipeline

### 2.1 Feature Contract & Schema
The model evaluates residential properties based on 6 core variables:

| Feature Name | Type | Processing Strategy | Value Constraints / Range |
|---|---|---|---|
| `location` | Categorical | `OneHotEncoder(handle_unknown='ignore')` | `Urban`, `Suburban`, `Rural` |
| `total_sqft` | Float | `SimpleImputer(median)` + `StandardScaler` | 101 to 30,000 sqft |
| `bedrooms` | Integer | `SimpleImputer(median)` + `StandardScaler` | 1 to 15 |
| `bathrooms` | Float | `SimpleImputer(median)` + `StandardScaler` | 1.0 to 12.0 |
| `year_built` | Integer | `SimpleImputer(median)` + `StandardScaler` | 1900 to 2030 |
| `has_garage` | Boolean | `SimpleImputer(median)` + `StandardScaler` | `True` / `False` |

* **Target Variable:** `price` (Continuous numeric in INR `₹`).

### 2.2 Training & Evaluation Methodology
* Data was split into **80% training** (2,000 samples) and **20% held-out testing** (500 samples) with fixed random seed (`42`).
* All preprocessing transformers (scalers, encoders, and imputers) were fit **strictly on training data** to eliminate data leakage.
* Three candidate regression algorithms were trained and evaluated on the held-out test set:

| Candidate Algorithm | MAE (Mean Absolute Error) | RMSE (Root Mean Squared Error) | R² Score | Decision |
|---|---|---|---|---|
| **Linear Regression** | ₹7,54,415.19 | ₹9,99,802.33 | 0.9241 | Baseline |
| **Decision Tree Regressor** | ₹6,60,014.36 | ₹8,83,836.22 | 0.9407 | Rejected |
| **Random Forest Regressor** | **₹5,25,263.07** | **₹7,07,998.28** | **0.9619** | **Selected Winner** |

### 2.3 Artifact Serialization & Reload Equivalence
* The fitted preprocessing pipeline and winning Random Forest Regressor are serialized as a single end-to-end artifact:
  * File: `ml/inference/artifacts/house_price_pipeline.joblib` (Size: ~3.7 MB, compression level 3).
  * Metadata: `ml/inference/artifacts/model_metadata.json` (records features, algorithms, hyperparameters, candidate metrics, and timestamp).
* **Reload Equivalence:** The artifact was verified with `np.testing.assert_allclose`, ensuring that deserializing the pipeline yields identical predictions to the in-memory fitted model.

### 2.4 Production Inference Loader
* Implemented in `ml/inference/model/loader.py`:
  * Employs a thread-safe double-checked lock pattern (`threading.Lock()`).
  * Loads the artifact **once at server startup**; subsequent calls return the cached singleton pipeline in `O(1)` memory lookup.
  * If the artifact is missing or corrupted, raises `ModelNotAvailableError`, which triggers an HTTP `503 Service Unavailable` response rather than returning an invalid fallback price.

---

## 3. Backend API & Security Architecture

### 3.1 100% Environment-Driven Configuration
* Managed via `pydantic-settings.BaseSettings` in `backend/app/core/config.py`.
* All properties (`PROJECT_NAME`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_ORIGINS`, `MODEL_ARTIFACT_PATH`, `TARGET_CURRENCY`) are dynamically loaded from runtime environment variables.
* Zero secrets are committed to the repository; only `.env.example` templates exist.

### 3.2 Server-Side Identity Verification & Authorization
* Implemented in `backend/app/core/security.py`:
  * **Zero-Trust Client Identity:** The client cannot supply a `user_id` in request payloads. The caller's identity is strictly extracted on the server from the verified Supabase Bearer JWT token.
  * **Role-Based Access Control (RBAC):**
    * Standard users can only access their own profile and prediction history.
    * Administrative routes (`/api/v1/admin/*`) require `get_current_admin`. If a regular user calls an admin endpoint, the server returns an HTTP `403 Forbidden` error. Hiding UI buttons alone is never trusted.

### 3.3 API Endpoints Specification

| Method | Endpoint | Auth Tier | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Liveness probe verifying process health. |
| `GET` | `/ready` | Public | Readiness probe verifying ML artifact availability. |
| `POST` | `/api/v1/predictions` | Authenticated User | Validates input, calculates ML estimate, persists snapshot. |
| `GET` | `/api/v1/predictions` | Authenticated User | Paginated prediction history belonging strictly to caller. |
| `GET` | `/api/v1/predictions/{id}` | Owner or Admin | Details of a specific prediction with ownership verification. |
| `GET` | `/api/v1/profile` | Authenticated User | Retrieves caller profile. |
| `PATCH` | `/api/v1/profile` | Authenticated User | Updates permitted profile fields (e.g. display name). |
| `GET` | `/api/v1/admin/summary` | Admin Only | Platform metrics: total users, predictions, average price. |
| `GET` | `/api/v1/admin/users` | Admin Only | Registered user directory with prediction volume counts. |
| `GET` | `/api/v1/admin/reports` | Admin Only | Date-filtered prediction reports with aggregate metrics. |

---

## 4. Database Architecture & Row-Level Security

Defined in `supabase/migrations/001_initial_schema.sql`:

### 4.1 Tables
* **`profiles`**:
  * `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  * `display_name TEXT`
  * `role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))`
  * `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`
* **`predictions`**:
  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
  * `input_data JSONB NOT NULL` (complete property snapshot)
  * `predicted_price NUMERIC NOT NULL CHECK (predicted_price >= 0)`
  * `currency TEXT NOT NULL DEFAULT 'INR'`
  * `model_version TEXT NOT NULL`
  * `created_at TIMESTAMPTZ`

### 4.2 Row-Level Security (RLS) Policies
* **`profiles` RLS:**
  * `SELECT`: `auth.uid() = id OR public.is_admin()`
  * `UPDATE`: `auth.uid() = id`
* **`predictions` RLS:**
  * `SELECT`: `auth.uid() = user_id OR public.is_admin()`
  * `INSERT`: `auth.uid() = user_id`

---

## 5. Automated Verification & Test Coverage

Test suite executed with `pytest tests/ -v`:
* **Health & Liveness (`test_health.py`):**
  * Root endpoint `/` contract test.
  * Liveness `/health` returning status 200 and timestamps.
  * Readiness `/ready` returning 200 with model loaded.
* **ML Pipeline (`test_pipeline.py`):**
  * Pipeline structure validation (`preprocessor` and `regressor` steps).
  * Positive finite numeric output assertion.
  * Graceful handling of unseen categorical values via `handle_unknown='ignore'`.
  * Completeness of `model_metadata.json` metrics.
  * Deserialization reload equivalence test.
* **API Endpoints & Security (`test_api.py`):**
  * Unauthenticated requests returning HTTP 401.
  * Invalid payload validation returning HTTP 422.
  * Authenticated prediction creation returning HTTP 201.
  * Data isolation: User A's predictions invisible to User B.
  * Cross-user direct ID access returning HTTP 404.
  * Non-admin access to admin endpoints returning HTTP 403.
  * Date-filtered admin report aggregation.
* **Boundary & Sanitization (`test_boundaries.py`):**
  * Minimum total square feet boundary (`100` rejected, `101` accepted).
  * Construction year bounds (`1899` and `2031` rejected).
  * Stack trace suppression on malformed payloads.

**Result: 18 passed in 9.80s (100% test pass rate).**

---

## 6. Cloud Deployment Specifications

1. **Backend on Render:**
   * Containerized with [backend/Dockerfile](file:///e:/realestateiq/backend/Dockerfile) (Python 3.13-slim).
   * Dynamically binds to Render's assigned `$PORT`.
   * Probed via `/health` health-check path.
   * Defined declaratively via [render.yaml](file:///e:/realestateiq/render.yaml).
2. **Frontend on Vercel:**
   * Built from `frontend/` directory.
   * Connects to backend over HTTPS via `NEXT_PUBLIC_API_BASE_URL`.
   * Connects to Supabase via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 7. Roadmap & Next Session Plan

* **Awaiting:** User's `design.md` detailing the visual theme, component design system, color palette, and layout.
* **Next Action:** Style and refine the frontend pages (`/`, `/predict`, `/dashboard`, `/history`, `/profile`, `/admin`) to match `design.md`.
* **Final Sign-off:** End-to-end user smoke testing and live cloud deployment.
