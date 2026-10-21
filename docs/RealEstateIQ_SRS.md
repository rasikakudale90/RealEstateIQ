# Software Requirements Specification (SRS)
## RealEstateIQ — Real Estate Price Prediction Using Machine Learning

**Document type:** Technical Software Requirements Specification  
**Version:** 1.0  
**Status:** Initial implementation baseline  
**Date:** 2026-10-21

---

## 1. Introduction

### 1.1 Purpose

This SRS defines the functional, non-functional, data, machine-learning, API, security, testing, and deployment requirements for RealEstateIQ. It is intended to be the single technical source of truth for implementation by developers and the Google Antigravity AI agent.

### 1.2 Scope

RealEstateIQ is a responsive web application that estimates residential property prices from user-provided property features using a trained machine-learning regression pipeline. It includes user authentication, property-price prediction, prediction history, profile management, and an administrator dashboard with user management and prediction reporting.

The system is an estimation aid, not a formal appraisal, mortgage valuation, or guarantee of a property's sale price.

### 1.3 Goals

- Provide a clear workflow for users to request property-price estimates.
- Train and evaluate candidate regression models using a documented dataset.
- Serve the selected trained model through a Python inference API.
- Persist user profiles and prediction records securely.
- Provide administrators with operational visibility and date-filtered reports.
- Support reproducible development, testing, and deployment using the agreed stack.

### 1.4 Terms

| Term | Meaning |
|---|---|
| UI | User interface |
| ML | Machine learning |
| Inference | Using a previously trained model to produce a prediction |
| Pipeline | Preprocessing transformations plus the trained estimator |
| MAE | Mean Absolute Error |
| RMSE | Root Mean Squared Error |
| R² | Coefficient of determination |
| RLS | Row-Level Security |
| API | Application Programming Interface |

### 1.5 Source basis and assumptions

The initial feature baseline is derived from the supplied document, *Real Estate Price Prediction Using Python and ML*, including its user/admin modules, property input fields, prediction history, and reports. The agreed implementation stack and repository layout are based on project decisions made during planning.

The source document does not establish a verified dataset, actual model accuracy, exact supported locations, production traffic, or a finalized currency/market. These must not be invented. The implementation must make such choices explicit in configuration and documentation before a production-quality model is claimed.

---

## 2. Product Overview

### 2.1 Product perspective

The application is split into a web frontend, a Python API, a machine-learning module, and a managed database/authentication service.

```text
Browser
  |
  v
Next.js frontend (Vercel)
  |
  | HTTPS requests
  v
FastAPI backend (Render)
  |             \
  |              \--> Supabase Auth / PostgreSQL
  |
  v
ML inference service
  |
  v
Saved preprocessing + regression pipeline (.joblib)
```

Offline training is separate from live requests:

```text
Housing dataset -> validation/EDA -> preprocessing -> train candidates
                -> evaluate/compare -> select model -> export pipeline
                -> deploy artifact with inference service
```

### 2.2 Agreed technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js, React, TypeScript | Pages, forms, responsive UI |
| Styling | Tailwind CSS | Layout and design system |
| Frontend hosting | Vercel | Build and host Next.js |
| Backend API | Python, FastAPI, Pydantic | Validation, API endpoints, orchestration |
| Backend hosting | Render | Host FastAPI and ML inference |
| ML | scikit-learn, Pandas, NumPy | Data preparation, training, evaluation |
| Model serialization | Joblib | Persist and load the fitted pipeline |
| Database | Supabase PostgreSQL | Profiles, prediction history, reporting data |
| Authentication | Supabase Auth | User identity and session lifecycle |
| Version control | Git/GitHub | Source control and deployment integration |
| Development environment | Google Antigravity IDE | AI-assisted implementation and testing |

Use supported stable versions compatible with each other, and pin dependencies after the environment is validated. Do not claim all services will remain free indefinitely; check current provider limits during deployment.

### 2.3 User roles

1. **Guest:** Can view public landing and authentication pages.
2. **Authenticated user:** Can submit predictions, view their own history, and manage permitted profile fields.
3. **Administrator:** Can access administrative dashboards, user-management actions, prediction records, and reports, subject to authorization rules.

Admin privileges must be assigned through trusted server-side configuration or protected database roles—not by allowing users to select their own role at registration.

---

## 3. Functional Requirements

Priority labels: **P0** = required for initial usable release; **P1** = important follow-up; **P2** = optional enhancement.

### 3.1 Public and authentication module

- **FR-AUTH-001 (P0):** The system shall provide a public landing page describing the prediction service.
- **FR-AUTH-002 (P0):** The system shall support user registration through Supabase Auth.
- **FR-AUTH-003 (P0):** The system shall support login and logout.
- **FR-AUTH-004 (P0):** The system shall provide authenticated route protection and server-side authorization checks.
- **FR-AUTH-005 (P0):** The system shall expose only the profile fields required by the application and shall not store plaintext passwords.
- **FR-AUTH-006 (P1):** The system should provide password-reset/recovery flow supported by the selected Supabase Auth configuration.
- **FR-AUTH-007 (P0):** The system shall distinguish regular users from administrators using trusted role data.

### 3.2 Property input and prediction module

- **FR-PRED-001 (P0):** Authenticated users shall be able to submit property details for an estimate.
- **FR-PRED-002 (P0):** The initial form shall support the fields from the source document: location category, total area in square feet, bedrooms, bathrooms, year built, and garage availability.
- **FR-PRED-003 (P0):** Input fields shall have clear labels, units, required/optional indicators, and validation messages.
- **FR-PRED-004 (P0):** The backend shall validate every submitted field independently of browser validation.
- **FR-PRED-005 (P0):** The backend shall reject malformed, non-finite, out-of-range, or unsupported inputs with a safe, actionable error response.
- **FR-PRED-006 (P0):** A valid request shall be passed to the loaded production ML pipeline.
- **FR-PRED-007 (P0):** The UI shall display the estimated price and a summary of the submitted property details.
- **FR-PRED-008 (P0):** The result shall identify the output currency and market assumptions configured for the model. The currency and market must be decided before release.
- **FR-PRED-009 (P0):** The UI shall explain that the output is an estimate and not a guaranteed market price.
- **FR-PRED-010 (P0):** Successful predictions shall be stored with the authenticated user's ID, input snapshot, prediction, and timestamp.
- **FR-PRED-011 (P1):** The system should show a clear retry path when the inference service is unavailable or times out.
- **FR-PRED-012 (P1):** The system may provide an estimate explanation based on model-supported feature importance, but must not imply causation or precision that the model does not support.

### 3.3 Prediction history

- **FR-HIST-001 (P0):** Authenticated users shall be able to list their own previous predictions.
- **FR-HIST-002 (P0):** Each history item shall show date/time, submitted property details, and estimated price.
- **FR-HIST-003 (P0):** Users shall not be able to read, modify, or delete another user's prediction records through the application or API.
- **FR-HIST-004 (P1):** The history list should support pagination or bounded result sizes.
- **FR-HIST-005 (P1):** Users may open a history item to view its stored input snapshot and result.

### 3.4 User profile

- **FR-PROF-001 (P0):** Authenticated users shall be able to view their profile.
- **FR-PROF-002 (P1):** Users should be able to update permitted profile fields.
- **FR-PROF-003 (P0):** Profile reads and writes shall be restricted to the authenticated user unless an authorized admin action is being performed.
- **FR-PROF-004 (P1):** Account deletion, if included, must define the corresponding Auth and prediction-record retention/deletion behavior before implementation.

### 3.5 Admin dashboard and reporting

- **FR-ADMIN-001 (P0):** The system shall provide an admin-only dashboard.
- **FR-ADMIN-002 (P0):** The dashboard shall display total registered users and total prediction records.
- **FR-ADMIN-003 (P0):** Authorized administrators shall be able to list users and view appropriate account/profile metadata.
- **FR-ADMIN-004 (P1):** Authorized administrators may deactivate or delete users only through a controlled, audited server-side workflow.
- **FR-ADMIN-005 (P0):** Administrators shall be able to view prediction records across users according to their permissions.
- **FR-ADMIN-006 (P0):** Administrators shall be able to filter prediction reports by a start date and end date.
- **FR-ADMIN-007 (P1):** Reports should show useful aggregate counts and prediction details for the selected date range.
- **FR-ADMIN-008 (P0):** Admin-only endpoints and UI routes shall enforce role checks on the server; hiding UI elements alone is insufficient.
- **FR-ADMIN-009 (P1):** Destructive admin actions should require confirmation and create an audit record.

### 3.6 UI and accessibility

- **FR-UI-001 (P0):** The UI shall be responsive on mobile, tablet, laptop, and desktop browsers.
- **FR-UI-002 (P0):** The UI shall provide loading, empty, success, validation-error, and service-error states.
- **FR-UI-003 (P0):** Forms shall be keyboard usable, have programmatically associated labels, and provide readable error messages.
- **FR-UI-004 (P1):** The UI should respect reduced-motion preferences.
- **FR-UI-005 (P0):** Dates, numeric values, and currency shall be formatted consistently with the configured market.

---

## 4. Machine-Learning Requirements

### 4.1 Training workflow

Training is an offline task. A user prediction request must never trigger model training.

1. Obtain and document a suitable housing dataset and its usage/license terms.
2. Validate schema, target column, units, missing values, duplicate rows, outliers, and leakage risks.
3. Split the data into training and held-out test sets before fitting preprocessing.
4. Build preprocessing and estimator steps in a reproducible scikit-learn pipeline.
5. Train and compare at least:
   - Linear Regression as a baseline.
   - Decision Tree Regressor.
   - Random Forest Regressor.
6. Tune only using training/validation data; do not repeatedly optimize against the final test set.
7. Evaluate the selected model on held-out test data.
8. Export the fitted preprocessing-plus-model pipeline and metadata.
9. Test that the exported artifact loads and produces the same predictions as the in-memory pipeline.
10. Deploy the artifact with the inference service.

### 4.2 Dataset and target definition

- The dataset must contain a documented numeric target representing property price.
- Every feature must have a defined meaning, type, allowed values, and units.
- Training features must match the inference API feature contract.
- The target currency, geographic market, data period, and intended property type must be documented.
- If the available dataset does not contain the required source-document fields, map only defensible equivalent fields or revise the form and requirements explicitly. Do not invent labels or fabricate data to claim model quality.
- Synthetic data may be used to test application plumbing only; metrics from synthetic data must not be presented as real-world model performance.

### 4.3 Preprocessing and consistency

- Missing-value handling, categorical encoding, and numerical transformations shall be fitted using training data only.
- Prefer a single fitted scikit-learn `Pipeline`/`ColumnTransformer` serialized as `house_price_pipeline.joblib`.
- Production inference shall reuse the exact fitted transformations; it must not refit encoders or scalers on incoming requests.
- Input feature order and names shall be enforced by the pipeline or explicit validation.
- Unsupported categories and missing features shall produce a controlled validation error or a documented safe handling strategy.
- Any model or preprocessing change must trigger evaluation and artifact-version updates.

### 4.4 Evaluation and model acceptance

Report at minimum:
- **MAE:** typical absolute error in target units.
- **RMSE:** error metric that penalizes larger errors more strongly.
- **R²:** comparison with a mean-target baseline, interpreted in dataset context.

The project shall record dataset identity/version, feature list, target units, split strategy, random seed, model parameters, metrics, training timestamp, and artifact version. No minimum accuracy threshold is asserted by this SRS because no dataset or baseline measurements have yet been supplied. Establish an acceptance threshold after the first valid evaluation and document its rationale.

### 4.5 Model artifact and loading

- The artifact shall be stored at a configured path, not a hard-coded developer-specific path.
- The artifact shall be loaded once at application startup or through a thread-safe cached loader—not reloaded on every prediction.
- If the artifact is absent or incompatible, the service shall fail readiness and return a safe error rather than silently inventing a prediction.
- Joblib artifacts shall only be loaded from trusted, version-controlled or controlled build sources because deserialization can execute code.
- Model artifacts should include a metadata file with model version, expected features, target units, metrics, and training timestamp.

### 4.6 Inference service

- **ML-FR-001:** The service shall expose a health/readiness endpoint.
- **ML-FR-002:** The service shall accept a validated property feature payload.
- **ML-FR-003:** The service shall return a numeric finite prediction and configured currency/unit metadata.
- **ML-FR-004:** The service shall handle invalid input, unavailable model, and prediction errors without leaking stack traces or secrets.
- **ML-FR-005:** The service shall log operational errors and request timing without logging credentials or unnecessary personal data.
- **ML-FR-006:** The API shall use the same feature schema and preprocessing assumptions as training.

---

## 5. System Architecture and Responsibilities

### 5.1 Frontend: `frontend/`

Suggested Next.js App Router layout:

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── predict/page.tsx
│   │   ├── history/page.tsx
│   │   └── admin/
│   ├── components/
│   ├── lib/
│   │   ├── supabase/
│   │   └── api-client.ts
│   └── types/
├── package.json
└── .env.example
```

Responsibilities:
- Render responsive pages and accessible forms.
- Maintain UI loading and error states.
- Call the backend over HTTPS for predictions.
- Integrate Supabase Auth using a supported Next.js server/client pattern.
- Never expose Supabase service-role keys or backend secrets to browser code.
- Avoid duplicate security-sensitive business logic in client components.

### 5.2 Backend: `backend/`

Suggested FastAPI layout:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/routes/
│   │   ├── health.py
│   │   └── predict.py
│   ├── schemas/
│   │   └── property.py
│   ├── services/
│   │   └── prediction_service.py
│   ├── core/
│   │   └── config.py
│   └── db/
├── requirements.txt
├── Dockerfile
└── .env.example
```

Responsibilities:
- Validate requests with Pydantic.
- Verify the caller's Supabase access token before protected operations.
- Enforce user ownership and admin role authorization.
- Load/call the ML inference module.
- Persist successful prediction records.
- Return documented JSON responses and appropriate HTTP status codes.
- Configure CORS to allow only the deployed frontend origin(s).
- Expose health/readiness endpoints for deployment checks.

The FastAPI service and ML inference code should run in the same Render service for the first release. A separate model-serving service is not required initially.

### 5.3 ML module: `ml/`

```text
ml/
├── training/
│   ├── data/
│   │   ├── raw/
│   │   ├── processed/
│   │   └── external/
│   ├── scripts/
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── generate_data.py
│   ├── experiments/
│   └── requirements.txt
├── inference/
│   ├── model/
│   │   ├── loader.py
│   │   └── predictor.py
│   ├── preprocessing/
│   │   └── preprocess.py
│   ├── services/
│   │   └── prediction_service.py
│   ├── artifacts/
│   │   ├── house_price_pipeline.joblib
│   │   └── model_metadata.json
│   └── config/
│       └── settings.py
├── pipeline/
│   └── pipeline.py
├── common/
│   ├── utils.py
│   └── constants.py
└── README.md
```

Implementation notes:
- Keep shared fitted preprocessing inside the serialized pipeline whenever possible; `preprocess.py` should validate/prepare request input without independently refitting transformations.
- `pipeline.py` may orchestrate shared functions, but training and production inference must have clear dependencies and must not create circular imports.
- Do not commit large, private, or licensed datasets without permission. Do not commit secrets.
- Include the artifact in the Render build only when its size and repository policy permit it; otherwise use a controlled artifact download process with version and integrity verification.

### 5.4 Database and migrations: `supabase/`

```text
supabase/
├── migrations/
└── seed.sql
```

Use SQL migrations as the source of truth for schema changes. Enable RLS on exposed tables and create least-privilege policies. Service-role access must remain server-side.

---

## 6. API Requirements

The exact API prefix may be `/api/v1`. All endpoints must be documented in OpenAPI and have request/response schemas.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public, minimal output | Liveness check |
| GET | `/ready` | Public, minimal output | Readiness/model-loaded check |
| POST | `/api/v1/predict` | Authenticated user | Generate and save prediction |
| GET | `/api/v1/predictions` | Authenticated user | List own prediction history |
| GET | `/api/v1/predictions/{id}` | Owner or authorized admin | Retrieve a prediction |
| GET | `/api/v1/profile` | Authenticated user | Get own profile |
| PATCH | `/api/v1/profile` | Authenticated user | Update permitted profile fields |
| GET | `/api/v1/admin/summary` | Admin only | Dashboard statistics |
| GET | `/api/v1/admin/users` | Admin only | List users |
| GET | `/api/v1/admin/predictions` | Admin only | Search/filter predictions |
| GET | `/api/v1/admin/reports` | Admin only | Date-filtered report data |

Admin user deletion/deactivation endpoints are optional follow-up work and must not be added without an explicit secure lifecycle design.

### 6.1 Prediction request example

```json
{
  "location": "Urban",
  "total_sqft": 1000,
  "bedrooms": 2,
  "bathrooms": 2,
  "year_built": 2015,
  "has_garage": false
}
```

This example represents the source document's field concepts. The exact schema and allowed location values must be reconciled with the selected dataset before implementation.

### 6.2 Prediction response example

```json
{
  "prediction_id": "uuid",
  "predicted_price": 7500000,
  "currency": "INR",
  "model_version": "1.0.0",
  "created_at": "2026-10-21T12:00:00Z"
}
```

The values are illustrative only; the actual output must come from the trained model and configured market/currency. Never return a fabricated fallback price when inference fails.

### 6.3 HTTP behavior

- `200`: Successful read or prediction.
- `201`: Resource created, where applicable.
- `400`: Malformed or semantically invalid request.
- `401`: Missing or invalid authentication.
- `403`: Authenticated but not authorized.
- `404`: Resource not found or not accessible to the caller.
- `422`: Schema validation error, if using FastAPI's validation convention consistently.
- `429`: Rate limit exceeded, if rate limiting is enabled.
- `500`: Unexpected internal error.
- `503`: Model/service not ready or temporarily unavailable.

Return consistent error objects with a safe message and optional request/correlation ID. Do not return raw tracebacks.

---

## 7. Database Requirements

### 7.1 `profiles`

| Column | Type (indicative) | Requirements |
|---|---|---|
| `id` | UUID | Primary key; matches Supabase Auth user ID |
| `display_name` | Text | Optional, length-limited |
| `role` | Enum/text with constraint | `user` or `admin`; controlled server-side |
| `created_at` | Timestamptz | Server-generated |
| `updated_at` | Timestamptz | Maintained on updates |

Email and credential lifecycle should be managed by Supabase Auth rather than duplicating passwords in `profiles`.

### 7.2 `predictions`

| Column | Type (indicative) | Requirements |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | References the authenticated user/profile |
| `input_data` | JSONB | Validated property input snapshot |
| `predicted_price` | Numeric | Finite, non-negative where valid for the market |
| `currency` | Text | Configured target currency |
| `model_version` | Text | Artifact version used |
| `created_at` | Timestamptz | Server-generated timestamp |

### 7.3 Database security and integrity

- Enable RLS for all user-accessible tables.
- Users may read their own profile and predictions only.
- Admin access must be based on a trusted role mechanism and enforced server-side.
- Never trust a `user_id` submitted by the browser; derive it from the verified identity token.
- Add indexes for `predictions.user_id`, `predictions.created_at`, and combinations needed for reports.
- Use migrations for schema changes and safe seed data only for development.
- Define a deletion/retention policy before production launch.

---

## 8. Non-Functional Requirements

### 8.1 Security

- All deployed traffic shall use HTTPS.
- Secrets shall be stored in Vercel/Render/Supabase environment settings, never committed to source control.
- The Supabase service-role key shall never be exposed to client-side code.
- All protected API requests shall validate identity and authorization server-side.
- Apply least privilege, RLS, input validation, safe error handling, and dependency updates.
- Configure CORS for known origins; CORS is not a substitute for authentication.
- Add sensible request size limits and rate limiting where practical, especially for prediction endpoints.
- Avoid logging tokens, passwords, full sensitive profile details, or secret configuration.
- Use trusted model artifacts only.

### 8.2 Performance and availability

- The inference service shall load the model once per worker process where practical.
- The application shall handle Render free-tier cold starts and show a loading/timeout message rather than appearing frozen.
- Use bounded pagination for history and admin lists.
- Avoid promising a fixed latency or uptime because free-tier hosting and dataset/model size are not yet benchmarked.
- Monitor memory usage; Render free web services have resource constraints, so model size and worker count must be tested.

### 8.3 Reliability

- A failed inference shall not create a successful prediction record.
- Database write failures shall be surfaced safely and handled consistently; do not show success if persistence is required but failed.
- The readiness endpoint shall reflect whether required model artifacts and configuration are available.
- Prediction responses shall include a model version for traceability.

### 8.4 Maintainability and reproducibility

- Use TypeScript for frontend code and Python type hints for backend/ML code.
- Keep separate dependency manifests for frontend, API, and training where practical.
- Pin dependencies after validating compatible versions.
- Use environment-specific configuration rather than hard-coded URLs or paths.
- Use migrations and document setup, training, testing, and deployment.
- Keep training-only heavy dependencies out of the inference image unless required at runtime.

### 8.5 Accessibility and compatibility

- Support current stable Chrome, Edge, Firefox, and Safari versions where practical.
- Provide keyboard navigation, visible focus, associated form labels, and readable contrast.
- Support responsive mobile, tablet, and desktop web layouts.
- Respect reduced-motion settings.

### 8.6 Privacy and data governance

- Collect only data required for the application.
- Explain that predictions are estimates.
- Define data retention and account deletion behavior before production.
- Use only datasets with appropriate usage rights and document their source and limitations.

---

## 9. Error Handling and Observability

- Frontend errors shall be understandable and shall not expose internal stack traces.
- Backend logs shall record exception class, request ID, route, status, and timing where appropriate.
- Prediction errors shall distinguish invalid input, model unavailability, and unexpected failures.
- Health checks shall not expose secrets, user data, environment values, or detailed infrastructure information.
- Record the model version and prediction timestamp for successful predictions.
- If external services are unavailable, return a safe error and do not fabricate a prediction.

---

## 10. Testing and Acceptance Criteria

### 10.1 Unit tests

- Test input validation boundaries and unsupported categories.
- Test pipeline loading and missing/corrupt artifact behavior.
- Test preprocessing consistency between training and inference.
- Test that predictions are finite numeric values.
- Test role/ownership helper functions.

### 10.2 API integration tests

- Valid authenticated prediction succeeds and persists one record.
- Invalid input returns a documented client error.
- Unauthenticated requests to protected endpoints are rejected.
- A user cannot access another user's prediction by changing an ID.
- A non-admin cannot access admin endpoints.
- Admin date filters return only records in the requested range.
- Database failure does not result in a false success response.
- Health/readiness behavior is correct with and without a model artifact.

### 10.3 ML evaluation tests

- Candidate models are trained on the training split only.
- Evaluation metrics are generated on held-out data.
- Feature names, order, types, and target units are documented.
- The saved artifact reloads successfully and gives equivalent predictions to the in-memory pipeline.
- A synthetic-data test run, if used, is explicitly labeled and is not represented as real-world accuracy.

### 10.4 Frontend tests

- Registration/login form validation works.
- Prediction form loading, validation, success, and error states work.
- History empty state and populated state render correctly.
- Admin pages are inaccessible to regular users.
- Responsive layout and keyboard navigation are checked.

### 10.5 Release acceptance checklist

The initial release is acceptable when:
1. The frontend builds and deploys successfully to Vercel.
2. FastAPI deploys successfully to Render and its health/readiness checks pass.
3. A documented, licensed/appropriate dataset is used for model training.
4. Candidate models are evaluated and metrics are recorded without fabricated claims.
5. The selected preprocessing-plus-model artifact is loaded by the production inference service.
6. An authenticated user can submit valid property details and receive a model-generated estimate.
7. Successful predictions are persisted and visible in that user's history.
8. Cross-user access is blocked and admin routes enforce role checks.
9. Admin statistics and date-filtered prediction reports work.
10. Environment variables, database migrations, deployment instructions, and known free-tier limitations are documented.

---

## 11. Deployment Requirements

### 11.1 Vercel frontend

- Set the project root to `frontend/` in a monorepo.
- Configure the production backend API base URL and public Supabase URL/anonymous key as appropriate.
- Use the framework's supported environment variable conventions; only intentionally public values may use the `NEXT_PUBLIC_` prefix.
- Configure preview and production environment values separately.
- Validate production build and auth redirects.

### 11.2 Render backend

- Set the service root/build context to the backend deployment arrangement chosen for the monorepo.
- Install backend runtime dependencies and ensure the ML module is importable.
- Configure the service start command using the Render-assigned port, for example:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- Configure model artifact path, Supabase server-side credentials if used, allowed frontend origins, and other required environment values.
- Add a health check path.
- Test cold starts, memory use, model load time, and prediction behavior after deployment.
- Do not rely on a free service's local runtime filesystem for persistent user data or durable generated artifacts.

### 11.3 Supabase

- Create project schema through migrations.
- Configure Auth URLs and redirect URLs for local development and deployed domains.
- Enable RLS and verify policies with user/admin test identities.
- Keep service-role credentials server-side only.
- Back up or export important schema/configuration as appropriate for the selected plan.

### 11.4 Environment variable templates

`frontend/.env.example` (names only, no real secrets):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=
```

`backend/.env.example`:

```dotenv
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
FRONTEND_ORIGINS=
MODEL_ARTIFACT_PATH=
MODEL_METADATA_PATH=
```

Use only the authentication verification variables supported by the chosen Supabase Auth/JWT validation method; do not configure or trust a legacy JWT secret without confirming it is appropriate. Never commit actual values. If the backend uses Supabase's public key plus user-scoped access tokens instead of a service-role key, configure the narrower approach where possible.

---

## 12. Repository-Level Project Layout

```text
real-estate-price-prediction/
├── frontend/                 # Next.js app deployed to Vercel
├── backend/                  # FastAPI API + production inference integration
├── ml/                       # Offline training and inference package
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── frontend/
│   ├── backend/
│   └── ml/
├── docs/
│   └── SRS.md
├── .gitignore
├── README.md
└── AGENTS.md                 # Antigravity project instructions
```

Recommended Git exclusions:
- `.env`, `.env.*` except `.env.example`
- Python virtual environments, `__pycache__/`, `.pytest_cache/`
- `node_modules/`, `.next/`, build outputs
- raw/private datasets unless approved for version control
- experiment logs and large generated files
- credentials, tokens, and private deployment configuration

Model artifacts should be included or fetched through a documented, versioned process based on size, licensing, and deployment needs.

---

## 13. Development Phases

### Phase 1 — Repository and foundations
- Create monorepo, frontend, backend, ML package, Supabase migrations, and environment templates.
- Establish linting, formatting, type checks, and tests.
- Implement health endpoint and frontend-to-backend connectivity.

### Phase 2 — Data and model
- Confirm target market, currency, and dataset.
- Perform data validation and exploratory analysis.
- Implement preprocessing and train candidate regressors.
- Evaluate and save the selected pipeline with metadata.

### Phase 3 — API and persistence
- Implement inference loader and prediction service.
- Add authentication verification, prediction endpoint, database persistence, and user history.
- Implement ownership, role enforcement, RLS, and error behavior.

### Phase 4 — User experience
- Implement landing, authentication, dashboard, prediction form, result view, history, and profile.
- Implement admin dashboard, user list, prediction search, and date-filtered reports.
- Add responsive styling, accessibility, and UI states.

### Phase 5 — Verification
- Run unit, integration, ML, and frontend tests.
- Verify model artifact consistency and security boundaries.
- Check error paths, memory usage, and cold starts.

### Phase 6 — Deployment
- Deploy Supabase schema and Auth settings.
- Deploy FastAPI and ML artifact to Render.
- Deploy Next.js to Vercel.
- Configure environment variables, origins, and redirects.
- Run smoke tests against production deployments.

---

## 14. Decisions Required Before Final Production Sign-Off

The following are unresolved because the source document and planning conversation do not provide enough evidence to decide them:

1. **Target market and currency:** Which country/region and price currency should the model represent?
2. **Dataset:** Which dataset will be used, and what are its source, license, feature definitions, and target column?
3. **Location feature:** Are locations broad categories such as Urban/Rural, named cities, or geographic coordinates?
4. **Feature availability:** Does the dataset genuinely support area, bedrooms, bathrooms, year built, and garage availability?
5. **Model acceptance threshold:** What MAE/RMSE or other criterion is acceptable after baseline evaluation?
6. **Account lifecycle:** Is email verification required? What is the account deletion and data retention policy?
7. **Admin provisioning:** Which secure process will create the first administrator?
8. **Report export:** Are on-screen reports enough, or is CSV/PDF export required?
9. **Deployment limits:** What model size, request volume, and cold-start delay are acceptable on free-tier hosting?

Do not silently invent answers. Record agreed decisions in this document or a linked implementation decision log before building the affected features.

---

## 15. Definition of Done

A feature is complete only when:
- Its requirements and acceptance behavior are met.
- Input validation and authorization are enforced server-side.
- Loading, success, empty, and error states are handled where applicable.
- Tests cover its main success and failure paths.
- No secrets are committed and no unauthorized data access is possible.
- Documentation and environment templates are updated.
- It works in the intended deployed architecture, not only on a developer's machine.

**End of SRS — Version 1.0**
