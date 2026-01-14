"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { KpiStat } from "@/lib/dashboardData";

const AnimatedNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 120, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    motionValue.set(value);
    return () => unsubscribe();
  }, [motionValue, spring, value]);

  return <motion.span className="text-3xl font-semibold text-[#0F172A]">{display}</motion.span>;
};

export function KpiGrid({ stats }: { stats: KpiStat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <GlassPanel
          key={stat.label}
          className="flex flex-col gap-3 bg-white/90"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-[#94A3B8]">
            <span>{stat.label}</span>
            <span className="text-[#2563EB]">{stat.delta}</span>
          </div>
          <div className="flex items-center justify-between">
            <AnimatedNumber value={stat.value} />
            <motion.div
              className="h-3 w-16 rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED]"
              animate={{ scaleX: [0.8, 1.05, 0.9] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
            />
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
