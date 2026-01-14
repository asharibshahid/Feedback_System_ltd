"use client";

import { motion } from "framer-motion";

type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Switch({ label, description, checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white/90 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
    >
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        {description && <p className="text-xs text-[#475569]">{description}</p>}
      </div>
      <motion.span
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
          checked ? "bg-gradient-to-r from-[#2563EB] to-[#7C3AED]" : "bg-[#E2E8F0]"
        }`}
        layout
      >
        <motion.span
          className="absolute h-6 w-6 rounded-full bg-white shadow-[0_10px_20px_rgba(15,23,42,0.2)]"
          animate={{ x: checked ? 26 : 2 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
      </motion.span>
    </button>
  );
}
