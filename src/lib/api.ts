import type { ApiError } from "@/types/inventory";

/** Typed fetch helper for POS API routes */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T } | { error: ApiError }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const body = (await res.json()) as T | ApiError;
    if (!res.ok) {
      return { error: body as ApiError };
    }
    return { data: body as T };
  } catch {
    return {
      error: { success: false, error: "Network error. Please try again." },
    };
  }
}
