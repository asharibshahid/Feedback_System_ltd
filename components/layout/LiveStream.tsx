"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type { FeedItem } from "@/lib/dashboardData";
import { Badge } from "@/components/ui/Badge";

type LiveStreamProps = {
  items: FeedItem[];
};

const statusVariants: Record<FeedItem["status"], "success" | "danger" | "warning"> = {
  Allowed: "success",
  Blocked: "danger",
  Pending: "warning",
};

export function LiveStream({ items }: LiveStreamProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const marqueeItems = useMemo(() => [...items, ...items], [items]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const interval = setInterval(() => {
      element.scrollBy({ top: 140, behavior: "smooth" });
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
        element.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      className="w-96 max-w-[340px] border-l border-[#E2E8F0] bg-white/90 px-6 py-6 shadow-[0_30px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 85, damping: 16 }}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Live stream</p>
        <h2 className="text-2xl font-semibold text-[#0F172A]">Visitor horizon</h2>
        <p className="text-sm text-[#475569]">Realtime arrivals & health status.</p>
      </div>
      <div
        ref={scrollRef}
        className="mt-6 h-[80vh] max-h-[560px] overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-b from-white/80 to-[#EFF6FF]/60 p-4"
      >
        <motion.div className="space-y-4" animate={{ y: ["0%", "-25%"] }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}>
          {marqueeItems.map((item, index) => (
            <motion.article
              key={`${item.name}-${index}`}
              className="rounded-[18px] border border-white/60 bg-white/70 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur"
              whileHover={{ translateY: -4, boxShadow: "0 25px 45px rgba(15,23,42,0.25)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              layout
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#0F172A]">{item.name}</p>
                  <p className="text-xs text-[#475569]">{item.purpose}</p>
                </div>
                <Badge variant={statusVariants[item.status]} className="px-3 py-1 text-[0.65rem]">
                  {item.status}
                </Badge>
              </div>
              <p className="mt-2 text-[0.65rem] text-[#94A3B8]">{item.time}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
