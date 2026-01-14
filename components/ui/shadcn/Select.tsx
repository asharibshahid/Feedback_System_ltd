"use client";

import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  helperText?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, className = "", ...props }, ref) => (
    <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
      <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">{label}</span>
      <div className="relative">
        <select
          {...props}
          ref={ref}
          className={`w-full appearance-none rounded-[12px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD] ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-2 text-xs text-[#94A3B8]">▾</span>
      </div>
      {error ? (
        <span className="text-xs text-[#DC2626]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#475569]">{helperText}</span>
      ) : null}
    </label>
  ),
);

Select.displayName = "Select";
