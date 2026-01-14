"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback } from "react";
import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-[min(520px,90vw)] rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.25)] p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Dialog</p>
              <h3 className="text-2xl font-semibold text-[#0F172A]">{title}</h3>
              {description && <p className="text-sm text-[#475569]">{description}</p>}
            </div>
            <div>{children}</div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[12px] border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F1F5F9]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
