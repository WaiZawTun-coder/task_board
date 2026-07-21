import { useAuth } from "@/context/AuthContext";
import { getBackendUrl } from "./url";
import { useCallback } from "react";

type CustomRequestInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export const useApi = () => {
  const { accessToken, refresh, authLoading, logout } = useAuth();

  const apiFetch = useCallback(
    async <T>(url: string, options: CustomRequestInit = {}): Promise<T> => {
      const request = async (retry: boolean): Promise<T> => {
        if (authLoading) throw new Error("Authentication is still loading");

        const isFormData = options.body instanceof FormData;
        const isString = typeof options.body === "string";

        const headers: HeadersInit = {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        };

        const formattedBody =
          isFormData || isString
            ? (options.body as BodyInit)
            : options.body
              ? JSON.stringify(options.body)
              : undefined;

        const res = await fetch(getBackendUrl() + url, {
          method: options.method || "GET",
          headers,
          body: formattedBody,
          credentials: "include",
        });

        const contentType = res.headers.get("Content-Type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : await res.text();

        if (!res.ok) {
          if (res.status === 401 && retry) {
            await refresh();
            return request(false);
          }

          if (res.status === 403) {
            logout();
            throw new Error("Unauthorized");
          }

          throw data;
        }

        return data as T;
      };

      return request(true);
    },
    [authLoading, accessToken, refresh, logout],
  );
  return apiFetch;
};
