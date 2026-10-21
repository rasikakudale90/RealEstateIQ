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

export interface ReadinessResponse {
  status: string;
  model_loaded: boolean;
  message?: string;
  timestamp: string;
  service?: string;
  version?: string;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function checkBackendReadiness(): Promise<ReadinessResponse> {
  const response = await fetch(`${API_BASE_URL}/ready`, {
    cache: "no-store",
  });
  return response.json();
}

export { API_BASE_URL };
