import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
const SESSION_KEY = "connectu-auth-session";

export interface LoginResponse {
  user_id: number;
  student_id: number;
  email: string;
  display_name: string;
  role: string;
  message?: string;
}

export type AuthResponse = LoginResponse;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  display_name: string;
  password: string;
}

async function request<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.detail ||
      body?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return body as T;
}

export function loginAccount(
  data: LoginRequest,
): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerAccount(
  data: RegisterRequest,
): Promise<void> {
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutAccount(): Promise<void> {
  await request("/api/auth/logout", {
    method: "POST",
  });
}

export async function saveSession(
  session: LoginResponse,
): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<LoginResponse | null> {
  const value = await AsyncStorage.getItem(SESSION_KEY);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as LoginResponse;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
