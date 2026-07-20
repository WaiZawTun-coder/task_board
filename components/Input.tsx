"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import clsx from "clsx";

type AppInputProps = {
  label?: string;
  name?: string;
  type?: "text" | "email" | "password" | "number";

  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  placeholder?: string;

  error?: boolean;
  errorMessage?: string;
  success?: boolean;

  disabled?: boolean;
  loading?: boolean;

  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;

  fullWidth?: boolean;
  className?: string;
};

export default function Input({
  label,
  name,
  type = "text",

  value,
  defaultValue,
  onChange,

  placeholder,

  error = false,
  errorMessage,
  success = false,

  disabled = false,
  loading = false,

  startIcon,
  endIcon,

  fullWidth = true,
  className,
}: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div
        className={clsx(
          "flex items-center rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all px-3 py-2",
          "bg-white/90 dark:bg-gray-700/90",

          error
            ? "border-red-500 ring-1 ring-red-500 focus-within:ring-2 focus-within:ring-red-500"
            : success
              ? "border-green-500 focus-within:ring-2 focus-within:ring-green-500"
              : "border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500",

          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {/* Start Icon */}
        {startIcon && <span className="mr-2 text-gray-400">{startIcon}</span>}

        {/* Input */}
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={clsx(
            "w-full bg-transparent outline-none text-sm",
            "text-gray-900 dark:text-white",
            "placeholder-gray-400 dark:placeholder-gray-500",
          )}
          aria-invalid={error}
        />

        {/* Loading */}
        {loading && (
          <Loader2 className="animate-spin w-4 h-4 text-gray-400 ml-2" />
        )}

        {/* Password Toggle */}
        {isPassword && !loading && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* End Icon */}
        {!loading && endIcon && (
          <span className="ml-2 text-gray-400">{endIcon}</span>
        )}
      </div>

      {/* Helper / Error */}
      {(error || success || errorMessage) && (
        <p
          className={clsx(
            "text-xs font-medium mb-2",
            error
              ? "text-red-500"
              : success
                ? "text-green-500"
                : "text-gray-500",
          )}
        >
          {error ? errorMessage : success ? "Looks good!" : ""}
        </p>
      )}
    </div>
  );
}
