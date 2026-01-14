"use client";

import { motion } from "framer-motion";

export type StatusChipProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "success" | "warning" | "danger" | "neutral";
};

const toneStyles: Record<NonNullable<StatusChipProps["tone"]>, string> = {
  success: "from-[#DCFCE7] to-[#E0F2FE] text-[#0F172A]",
  warning: "from-[#FFFBEB] to-[#FEF3C7] text-[#92400E]",
  danger: "from-[#FEF2F2] to-[#FEE2E2] text-[#B91C1C]",
  neutral: "from-[#E0ECFF] to-[#E0F2FE] text-[#0F172A]",
};

export function StatusChip({ label, value, detail, tone = "neutral" }: StatusChipProps) {
  return (
    <motion.div
      className={`flex flex-col rounded-[24px] border border-white/70 bg-gradient-to-br px-5 py-4 shadow-[0_25px_50px_rgba(15,23,42,0.15)] backdrop-blur-3xl ${toneStyles[tone]}`}
      initial={{ scale: 0.96, opacity: 0.85 }}
      animate={{ scale: [0.96, 1], opacity: [0.85, 1], y: [0, -2, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.4em]">{label}</span>
      <span className="text-3xl font-semibold">{value}</span>
      <span className="text-xs text-[#475569]">{detail}</span>
    </motion.div>
  );
}
