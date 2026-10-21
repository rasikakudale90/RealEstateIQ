/**
 * Environment-driven API Client for RealEstateIQ Backend
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

export interface PropertyInput {
  location: string;
  total_sqft: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  has_garage: boolean;
}

export interface PredictionResult {
  prediction_id: string;
  predicted_price: number;
  currency: string;
  model_version: string;
  created_at: string;
  input_data: PropertyInput;
}

export interface PredictionHistoryItem {
  id: string;
  user_id: string;
  input_data: PropertyInput;
  predicted_price: number;
  currency: string;
  model_version: string;
  created_at: string;
}

export interface PredictionHistoryResponse {
  total: number;
  page: number;
  limit: number;
  items: PredictionHistoryItem[];
}

export interface AdminSummary {
  total_users: number;
  total_predictions: number;
  average_predicted_price: number;
  currency: string;
}

export interface AdminUserItem {
  id: string;
  display_name: string;
  email: string;
  role: string;
  created_at?: string;
  prediction_count: number;
}

export interface AdminReport {
  start_date: string;
  end_date: string;
  total_count: number;
  average_price: number;
  currency: string;
  predictions: PredictionHistoryItem[];
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  return response.json();
}

export async function submitPrediction(
  data: PropertyInput,
  token: string
): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Prediction failed with status: ${response.status}`);
  }
  return response.json();
}

export async function fetchUserPredictions(
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<PredictionHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/predictions?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error("Failed to load prediction history");
  return response.json();
}

export async function fetchAdminSummary(token: string): Promise<AdminSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/summary`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Admin summary unavailable");
  return response.json();
}

export async function fetchAdminUsers(token: string): Promise<AdminUserItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Admin users list unavailable");
  return response.json();
}

export async function fetchAdminReport(
  token: string,
  startDate: string,
  endDate: string
): Promise<AdminReport> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/reports?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error("Admin report generation failed");
  return response.json();
}

export { API_BASE_URL };
