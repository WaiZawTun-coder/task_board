"use client";

import { getBackendUrl } from "@/utilities/url";
import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

let refreshRequest: Promise<string> | null = null;

type AuthContextType = {
  user: {
    email: string;
    exp: number;
    iat: number;
    user_id: number;
    username: string;
  } | null;
  accessToken: string | null;
  authLoading: boolean;
  login: ({
    username,
    password,
    rememberMe,
  }: {
    username: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  register: ({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  refresh: () => Promise<string>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext) as AuthContextType;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextType["user"] | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const isInitialized = useRef(false);

  const login = useCallback(
    async ({
      username,
      password,
      rememberMe,
    }: {
      username: string;
      password: string;
      rememberMe: boolean;
    }) => {
      const res = await fetch(getBackendUrl() + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || data.error || "Unknown Error");

      if (!data.success) {
        throw new Error(data.message || data.error || "Unable to login");
      }

      setAccessToken(data.data.token);
      setUser(data.data);
      setAuthLoading(false);
    },
    [],
  );

  const getUser = useCallback(async ({ newToken }: { newToken: string }) => {
    const res = await fetch(getBackendUrl() + "/api/protected/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      },
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok)
      throw new Error(
        data.message || data.error || "Unable to fetch user info",
      );

    if (!data.success) {
      throw new Error(
        data.message || data.error || "Unable to fetch user info",
      );
    }

    setUser(data.data);
  }, []);

  const logout = useCallback(async () => {
    const res = await fetch(getBackendUrl() + "/api/protected/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId: user?.user_id }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Unable to logout user");
    }

    if (!data.success) {
      throw new Error(data.message || data.error || "Unable to logout user");
    }

    setAccessToken(null);
    setUser(null);

    router.replace("/login");
  }, [accessToken, router, user?.user_id]);

  const register = useCallback(
    async ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => {
      const res = await fetch(getBackendUrl() + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Unable to register new User",
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || data.error || "Unable to register new User",
        );
      }
    },
    [],
  );

  const refresh = useCallback((): Promise<string> => {
    if (refreshRequest) return refreshRequest;

    refreshRequest = (async () => {
      const res = await fetch(getBackendUrl() + "/api/protected/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || data.error || "Unable to validate user",
        );

      if (!data.success)
        throw new Error(
          data.message || data.error || "Unable to validate user",
        );

      setAccessToken(data.data.token);
      return data.data.token;
    })();

    refreshRequest.then(
      () => {
        refreshRequest = null;
      },
      () => {
        refreshRequest = null;
      },
    );

    return refreshRequest;
  }, []);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let alive = true;

    (async () => {
      try {
        const token = await refresh();
        if (!alive || !token) return;

        await getUser({ newToken: token });
        // await getUser(token);
      } catch {
        if (!alive) return;
        setAccessToken(null);
        setUser(null);

        console.log("pathname: ", pathname);
        if (pathname !== "/") router.replace("/login");
      } finally {
        if (alive) setAuthLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [getUser, refresh, router, pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        authLoading,
        login,
        logout,
        register,
        refresh,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
