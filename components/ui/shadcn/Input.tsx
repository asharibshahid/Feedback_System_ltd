"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = "", ...props }, ref) => (
    <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
      <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">{label}</span>
      <input
        {...props}
        ref={ref}
        className={`w-full rounded-[12px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD] ${className}`}
      />
      {error ? (
        <span className="text-xs text-[#DC2626]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#475569]">{helperText}</span>
      ) : null}
    </label>
  ),
);

Input.displayName = "Input";
