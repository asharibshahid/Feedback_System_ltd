"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScrollPanel } from "@/components/ui/ScrollPanel";
import { useVisitorFlow } from "@/components/visitor/VisitorFlowProvider";

export default function VisitorThanksPage() {
  const router = useRouter();
  const { identity, visitDetails, health, selfie, consent } = useVisitorFlow();
  const warnings = useMemo(() => Object.entries(health).filter(([, value]) => value), [health]);
  const timestamp = useMemo(() => new Date(visitDetails.date), [visitDetails.date]);
  const instructions = useMemo(() => {
    const list = [
      {
        title: "Badge collection",
        detail: "Pick up your personalized badge at the concierge kiosk near Lobby A.",
      },
      {
        title: "Escort lane",
        detail: `Proceed via ${visitDetails.entryLane} and wait beside the blue lane markers.`,
      },
      {
        title: warnings.length ? `Health alert: ${warnings[0][0]}` : "Health clearance",
        detail: warnings.length
          ? "The HACCP auditor will review your answers. Remain near the safety desk."
          : "No symptoms reported. You may access the production floor.",
      },
    ];
    return list;
  }, [visitDetails.entryLane, warnings]);
  const dateLabel = timestamp.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-32">
        <header className="space-y-2">
          <div className="flex items-center justify-between rounded-[20px] border border-[#E2E8F0] bg-white/70 px-5 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Visitor wrap</p>
              <h1 className="text-3xl font-semibold text-[#0F172A]">Command confirmed</h1>
            </div>
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCFCE7] text-2xl text-[#16A34A] shadow-[0_20px_50px_rgba(37,99,235,0.25)]"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              ?
            </motion.div>
          </div>
          <p className="text-sm text-[#475569]">
            The gate team has received your data. Follow the instructions below and stay close to your assigned lane for escort coordination.
          </p>
        </header>
        <div className="flex flex-wrap gap-3 rounded-[20px] border border-[#E2E8F0] bg-white/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#475569] shadow-sm">
          <Link href="/visitor/checkin" className="rounded-full border border-[#CBD5E1] px-4 py-2 text-[0.65rem] transition hover:border-[#2563EB] hover:text-[#2563EB]">
            Back to check-in
          </Link>
          <Link href="/admin" className="rounded-full border border-[#2563EB] px-4 py-2 text-[0.65rem] text-[#2563EB] transition hover:bg-[#EFF6FF]">
            Next: Admin
          </Link>
          <Link href="/" className="rounded-full border border-[#CBD5E1] px-4 py-2 text-[0.65rem] transition hover:border-[#2563EB] hover:text-[#2563EB]">
            Exit
          </Link>
        </div>

        <ScrollPanel
          panelStyle={{ height: "72vh" }}
          panelClassName="space-y-6"
          className="border border-white/70 bg-white/60 shadow-[0_35px_90px_rgba(15,23,42,0.25)]"
        >
          <GlassPanel className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[#94A3B8]">Registered</p>
                <p className="text-2xl font-semibold text-[#0F172A]">{timeLabel}</p>
                <p className="text-[0.65rem] text-[#475569]">{dateLabel}</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[#94A3B8]">Entry lane</p>
                <p className="text-2xl font-semibold text-[#0F172A]">{visitDetails.entryLane}</p>
                <p className="text-[0.65rem] text-[#475569]">Priority {visitDetails.priority}%</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[#94A3B8]">Consent</p>
                <p className={`text-2xl font-semibold ${consent ? "text-[#16A34A]" : "text-[#92400E]"}`}>
                  {consent ? "Granted" : "Missing"}
                </p>
                <p className="text-[0.65rem] text-[#475569]">Data usage ok</p>
              </div>
            </div>
            <div className="rounded-[18px] border border-[#E2E8F0] bg-white/80 px-4 py-3 text-sm text-[#475569]">
              Entry status: <span className="font-semibold text-[#0F172A]">Awaiting escort</span>. Please stay near the concierge to meet your host.
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Visitor</p>
                <h2 className="text-xl font-semibold text-[#0F172A]">{identity.fullName || "Guest"}</h2>
              </div>
              <span className="text-sm text-[#475569]">{identity.company || "Independent visitor"}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[18px] border border-[#E2E8F0] bg-white/80 p-4 text-sm">
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[#94A3B8]">Mobile</p>
                <p className="text-base font-semibold text-[#0F172A]">{identity.mobile || "-"}</p>
                <p className="text-[0.7rem] text-[#475569]">Meeting with {visitDetails.meetingWith || "TBD"}</p>
              </div>
              <div className="rounded-[18px] border border-[#E2E8F0] bg-white/80 p-4 text-sm">
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[#94A3B8]">Purpose</p>
                <p className="text-base font-semibold text-[#0F172A]">{visitDetails.purpose}</p>
                {visitDetails.purpose === "Other" && (
                  <p className="text-[0.7rem] text-[#475569]">Reason: {visitDetails.otherPurpose || "-"}</p>
                )}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Health & safety</p>
              <span className="text-xs text-[#475569]">{warnings.length ? `${warnings.length} alerts` : "All clear"}</span>
            </div>
            {warnings.length === 0 ? (
              <p className="text-sm text-[#475569]">All health questions answered No. You are cleared for the facility.</p>
            ) : (
              <ul className="space-y-2 text-sm text-[#92400E]">
                {warnings.map(([question]) => (
                  <li key={question}>Alert: {question}</li>
                ))}
              </ul>
            )}
          </GlassPanel>

          <GlassPanel className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Instructions</p>
              <span className="text-xs text-[#475569]">Stay close to the blue line</span>
            </div>
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <motion.div
                  key={instruction.title}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: (i: number) => ({
                      opacity: 1,
                      y: 0,
                      transition: { delay: i * 0.1, type: "spring", stiffness: 120 },
                    }),
                  }}
                  className="rounded-[18px] border border-[#E2E8F0] bg-white/80 px-4 py-3 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">{instruction.title}</p>
                  <p className="text-sm text-[#475569]">{instruction.detail}</p>
                </motion.div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Selfie</p>
              <span className="text-xs text-[#475569]">Recorded snapshot</span>
            </div>
            <div className="relative h-48 overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-[#F1F5F9]">
              {selfie.snapshot ? (
                <Image
                  src={selfie.snapshot}
                  alt="Captured selfie"
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#475569]">No selfie recorded.</div>
              )}
            </div>
          </GlassPanel>
        </ScrollPanel>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/visitor/checkin")}
            className="rounded-[14px] border border-[#CBD5E1] bg-white px-5 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            New visitor
          </button>
        </div>
      </div>
    </div>
  );
}
