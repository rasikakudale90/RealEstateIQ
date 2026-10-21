# RealEstateIQ — Agent Instructions

## 1. Project Context

- **Project:** RealEstateIQ — Real Estate Price Prediction Using Machine Learning.
- **Purpose:** Estimate residential property prices from property features using a trained ML regression pipeline.
- **Primary specification:** `docs/RealEstateIQ_SRS.md`.
- Read the relevant SRS sections before implementing features. If a requirement is unclear, state the assumption and choose the smallest safe implementation rather than silently inventing behavior.
- Keep the application suitable for development and deployment using Google Antigravity IDE and free-tier services where feasible.

## 2. Approved Stack and Architecture

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS; deploy to Vercel.
- **Backend API:** Python, FastAPI, Pydantic; deploy to Render.
- **ML:** scikit-learn, Pandas, NumPy.
- **Model serialization:** Joblib.
- **Database and authentication:** Supabase PostgreSQL and Supabase Auth.
- **Tests:** Pytest/HTTPX for Python; use suitable frontend tests where needed.
- **Version control:** Git/GitHub when authorized.

Keep FastAPI and ML inference in the same Render service for the initial release. The frontend calls the backend over HTTPS. Supabase stores profiles and prediction history.

Avoid adding unnecessary infrastructure or dependencies. Do not introduce a separate model-serving platform, orchestration framework, cache, queue, or additional database unless a clear need is documented and approved. Verify current provider limits and compatible library versions rather than assuming them.

## 3. MVP Scope

Implement these core capabilities:

1. **Authentication and profiles:** Registration, login/logout, protected routes, and permitted profile management.
2. **Price prediction:** Accept property details, validate them, run the trained model, and display an estimated price with configured currency/market context.
3. **Prediction history:** Save successful predictions and allow users to view only their own records.
4. **Admin dashboard:** Show user/prediction totals, authorized user management, prediction search, and date-filtered reports.
5. **ML training and evaluation:** Train and compare candidate regressors, record metrics, and export the selected fitted pipeline.
6. **Deployment and reliability:** Health checks, safe error handling, environment configuration, tests, and Vercel/Render deployment.

Do not fabricate predictions, dataset facts, or model accuracy. Treat the result as an estimate, not a guaranteed sale price or formal appraisal.

## 4. ML Training and Inference Rules

- Keep offline training in `ml/training/` and production inference logic in `ml/inference/`.
- Train and compare at least Linear Regression, Decision Tree Regressor, and Random Forest Regressor when supported by the dataset.
- Evaluate using held-out data and report MAE, RMSE, and R². Do not claim a model is accurate until evaluation has actually run.
- Confirm dataset source/license, target column, market, currency, units, and available features before finalizing the model.
- Prefer one serialized scikit-learn pipeline, such as `house_price_pipeline.joblib`, containing fitted preprocessing and the estimator.
- Fit preprocessing on training data only. Reuse the same fitted transformations during inference; never refit encoders or scalers for each request.
- Load the trusted model artifact once at service startup or through a safe cached loader, not on every request.
- If the model is missing or incompatible, fail readiness and return a safe error. Never return a made-up fallback price.
- Treat synthetic data as plumbing/test data only; do not present synthetic-data metrics as real-world performance.

## 5. Implementation Workflow

1. **Inspect first:** Review the repository, existing code, project instructions, SRS, and environment before editing.
2. **Plan a small vertical slice:** Identify files, dependencies, tests, and acceptance criteria.
3. **Implement incrementally:** Avoid generating the whole application in one pass or overwriting existing work without inspection.
4. **Test the change:** Run relevant tests and report actual commands and results.
5. **Review security and regressions:** Check validation, authorization, data isolation, model compatibility, and error paths.
6. **Summarize:** State what changed, tests run, results, known limitations, and the next step.

Recommended order: repository/configuration foundation; dataset and training pipeline; inference API; Supabase schema/auth and prediction persistence; user UI; admin UI/reports; testing; deployment hardening.

## 6. API, Database, and Security

- Keep API route handlers thin; put model and business logic in service modules.
- Use Pydantic schemas, clear HTTP status codes, bounded requests, and consistent safe error responses.
- Provide health/readiness endpoints and document API contracts.
- Verify authentication and authorization on the server for every protected operation.
- Derive `user_id` from the verified identity; never trust a browser-supplied user ID.
- Enforce user ownership for history and profile data. Admin endpoints must verify a trusted server-side role.
- Enable Supabase Row Level Security (RLS) on user-accessible tables and use least-privilege policies.
- Keep Supabase service-role credentials and other secrets server-side; never commit real credentials or expose them in browser code.
- Configure CORS for known frontend origins. CORS is not a replacement for authentication.
- Use database migrations for schema changes and keep `.env.example` files free of real secrets.
- Do not load untrusted Joblib files; deserialization can execute code.

## 7. Testing and Acceptance

Add tests alongside each feature. At minimum, test:

- API health/readiness and missing model behavior.
- Valid/invalid property inputs and prediction response shape.
- Pipeline loading and preprocessing consistency between training and inference.
- Model evaluation and artifact reload equivalence.
- Authentication, user ownership, and admin authorization.
- Successful prediction persistence and user history isolation.
- Admin date-filtered reports.
- Provider/database failures and safe error handling.

Use deterministic fixtures and mocked external services for unit tests. Clearly identify tests not run because credentials or services are unavailable. Never claim tests passed unless they were run.

## 8. Deployment and Scope Control

- Deploy the Next.js app from `frontend/` to Vercel and the FastAPI service to Render, following the repository setup.
- Configure production URLs, CORS, Supabase Auth redirects, model paths, and environment variables separately from local development.
- Test Render cold starts, model load time, memory usage, and timeouts within free-tier constraints.
- Do not rely on Render's ephemeral filesystem for durable user data. Bundle the model artifact with the service when practical, or use a controlled versioned download with integrity checks.
- Do not deploy, create external resources, modify hosted databases, or consume paid services without explicit authorization.
- Keep the first release focused. Defer advanced explanations, exports, complex analytics, retraining automation, and additional infrastructure unless the owner approves them.
- Keep `docs/RealEstateIQ_SRS.md`, `README.md`, and configuration examples aligned with implementation changes.

## 9. Communication and Reporting

- Be direct and practical; prefer actionable steps.
- Explain meaningful trade-offs before adding architectural complexity.
- Never invent test results, deployment URLs, credentials, dataset facts, model metrics, or provider quotas.
- If blocked, state what is missing and the smallest next action.
- Use English for all communication and generated project content.

## 10. Call me by my name

- Address the user as **Rasika Babe** when speaking directly to them.
- Use the name naturally and respectfully; do not force it into every sentence.
