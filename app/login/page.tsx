"use client";

import Input from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type LoginFormData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{
    username: string;
    password: string;
    global: string;
  }>({ username: "", password: "", global: "" });

  const handleChange = <K extends keyof LoginFormData>({
    keyValue,
    value,
  }: {
    keyValue: K;
    value: LoginFormData[K];
  }) => {
    setFormData((prev) => ({ ...prev, [keyValue]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setError({ username: "", password: "", global: "" });

    let isValid = true;

    if (formData.username.trim() === "") {
      setError((prev) => ({ ...prev, username: "Username cannot be empty" }));
      isValid = false;
    }

    if (formData.password.trim() === "") {
      setError((prev) => ({ ...prev, password: "Password cannot be empty" }));
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await login(formData);

      router.push("/home");
    } catch (err: unknown) {
      setError((prev) => ({
        ...prev,
        global: err instanceof Error ? err.message : "Unexpected error occured",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // check if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl"></div>

          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/60 dark:border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Sign in to continue to TaskBoard
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                placeholder="you@example.com"
                startIcon={<Mail />}
                className="w-full bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                value={formData.username}
                onChange={(e) => {
                  handleChange({ keyValue: "username", value: e.target.value });
                }}
                error={error.username.trim() !== ""}
                errorMessage={error.username}
                loading={isSubmitting}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                startIcon={<Lock />}
                value={formData.password}
                onChange={(e) => {
                  handleChange({ keyValue: "password", value: e.target.value });
                }}
                error={error.password.trim() !== ""}
                errorMessage={error.password}
                loading={isSubmitting}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    checked={formData.rememberMe}
                    onChange={(e) => {
                      handleChange({
                        keyValue: "rememberMe",
                        value: e.target.checked,
                      });
                    }}
                  />
                  <span className="text-gray-600 dark:text-gray-300">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {error.global.trim() !== "" && (
                <span className="text-xs text-red-500 dark:text-red-400 font-medium mb-2">
                  {error.global}
                </span>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    Signing In...{" "}
                    <Loader2 className="animate-spin w-4 h-4 text-gray-400 ml-2" />
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/60 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  className="py-3 px-4 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 font-medium"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                {/* <button
                  type="button"
                  className="py-3 px-4 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 font-medium"
                >
                  <Apple className="w-5 h-5" />
                  GitHub
                </button> */}
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
