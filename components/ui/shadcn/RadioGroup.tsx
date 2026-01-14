"use client";

import { motion } from "framer-motion";

type RadioOption = {
  label: string;
  value: string;
  helper?: string;
};

type RadioGroupProps = {
  label: string;
  value: string;
  options: RadioOption[];
  onValueChange: (value: string) => void;
};

export function RadioGroup({ label, value, options, onValueChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">{label}</div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onValueChange(option.value)}
              className={`flex min-w-[120px] flex-col items-start justify-center gap-1 rounded-[14px] border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-[#2563EB] bg-white shadow-[0_20px_35px_rgba(37,99,235,0.25)]"
                  : "border-[#E2E8F0] bg-white/80"
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-sm font-semibold text-[#0F172A]">{option.label}</span>
              {option.helper && <span className="text-[0.7rem] text-[#475569]">{option.helper}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
