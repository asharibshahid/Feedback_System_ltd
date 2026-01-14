"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScrollPanel } from "@/components/ui/ScrollPanel";
import { Dialog } from "@/components/ui/shadcn/Dialog";
import { Sheet } from "@/components/ui/shadcn/Sheet";
import { RadioGroup } from "@/components/ui/shadcn/RadioGroup";
import { Select } from "@/components/ui/shadcn/Select";
import { Switch } from "@/components/ui/shadcn/Switch";
import { healthQuestions, useVisitorFlow } from "@/components/visitor/VisitorFlowProvider";

const sectionLabels = [
  { id: "identity", label: "Identity" },
  { id: "visitDetails", label: "Visit details" },
  { id: "health", label: "Health" },
  { id: "selfie", label: "Selfie" },
  { id: "consent", label: "Consent" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const purposeOptions = [
  { label: "Meeting", value: "Meeting" },
  { label: "Delivery", value: "Delivery" },
  { label: "Inspection", value: "Inspection" },
  { label: "Interview", value: "Interview" },
  { label: "Contractor", value: "Contractor" },
  { label: "Other", value: "Other" },
];

const entryLaneOptions = [
  { label: "North Gate", value: "North Gate" },
  { label: "South Dock", value: "South Dock" },
  { label: "Logistics Hub", value: "Logistics Hub" },
  { label: "Tech Atrium", value: "Tech Atrium" },
];

const progressRadius = 56;
const progressCircumference = 2 * Math.PI * progressRadius;

type SmartHint = {
  title: string;
  detail: string;
  sectionIndex: number;
  tone: "info" | "warning" | "success";
  buttonLabel: string;
};

export default function VisitorCheckinPage() {
  const router = useRouter();
  const {
    identity,
    visitDetails,
    health,
    selfie,
    consent,
    updateIdentity,
    updateVisitDetails,
    updateHealth,
    updateSelfie,
    updateConsent,
    markSubmitted,
  } = useVisitorFlow();

  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "active" | "error">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [highlightedSection, setHighlightedSection] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const visitDetailsRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);
  const selfieRef = useRef<HTMLDivElement>(null);
  const consentRef = useRef<HTMLDivElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const meetingRef = useRef<HTMLInputElement>(null);
  const otherPurposeRef = useRef<HTMLInputElement>(null);
  const consentCheckboxRef = useRef<HTMLInputElement>(null);

  const identityComplete = useMemo(
    () => identity.fullName.trim().length > 0 && identity.mobile.trim().length > 0,
    [identity.fullName, identity.mobile],
  );

  const visitDetailsComplete = useMemo(() => {
    if (!visitDetails.meetingWith.trim()) {
      return false;
    }
    if (visitDetails.purpose === "Other" && !visitDetails.otherPurpose.trim()) {
      return false;
    }
    return true;
  }, [visitDetails.meetingWith, visitDetails.purpose, visitDetails.otherPurpose]);

  const selfieComplete = Boolean(selfie.snapshot);
  const consentComplete = consent;
  const healthAlert = useMemo(() => Object.values(health).some(Boolean), [health]);

  const completionPercent = useMemo(() => {
    const flags = [identityComplete, visitDetailsComplete, selfieComplete, consentComplete];
    return Math.round((flags.filter(Boolean).length / flags.length) * 100);
  }, [identityComplete, visitDetailsComplete, selfieComplete, consentComplete]);

  const isAllComplete = identityComplete && visitDetailsComplete && selfieComplete && consentComplete;

  const smartHint = useMemo<SmartHint>(() => {
    if (!identityComplete) {
      return {
        title: "Identity incomplete",
        detail: "Add your full name and mobile so the gate team can issue a badge instantly.",
        sectionIndex: 0,
        tone: "warning",
        buttonLabel: "Finish identity",
      };
    }
    if (!visitDetailsComplete) {
      return {
        title: "Visit details pending",
        detail: "Select a host, purpose, and entry lane before moving forward.",
        sectionIndex: 1,
        tone: "warning",
        buttonLabel: "Describe visit",
      };
    }
    if (healthAlert) {
      return {
        title: "Health flags detected",
        detail: "An alert was raised. HACCP may review before granting access.",
        sectionIndex: 2,
        tone: "warning",
        buttonLabel: "Review health",
      };
    }
    if (!selfie.snapshot) {
      return {
        title: "Selfie missing",
        detail: "Capture your photo so the security team can confirm your identity.",
        sectionIndex: 3,
        tone: "info",
        buttonLabel: "Grab selfie",
      };
    }
    if (!consentComplete) {
      return {
        title: "Consent required",
        detail: "Authorize data usage to unlock the submit control.",
        sectionIndex: 4,
        tone: "info",
        buttonLabel: "Grant consent",
      };
    }
    return {
      title: "Ready for the gate",
      detail: "All sections are aligned. Hit submit when ready.",
      sectionIndex: 4,
      tone: "success",
      buttonLabel: "Submit now",
    };
  }, [consentComplete, healthAlert, identityComplete, visitDetailsComplete, selfie.snapshot]);

  const progressOffset = progressCircumference - (completionPercent / 100) * progressCircumference;

  const scrollToSection = useCallback((index: number) => {
    const targets = [identityRef, visitDetailsRef, healthRef, selfieRef, consentRef];
    const target = targets[index]?.current;
    const container = scrollContainerRef.current;
    if (!container || !target) return;
    const scrollTop = target.offsetTop - container.offsetTop + container.scrollTop - 12;
    container.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
    setActiveSection(index);
  }, []);

  const focusSectionInput = useCallback(
    (index: number) => {
      if (index === 0) {
        if (!identity.fullName.trim()) {
          fullNameRef.current?.focus();
        } else {
          mobileRef.current?.focus();
        }
      }
      if (index === 1) {
        if (!visitDetails.meetingWith.trim()) {
          meetingRef.current?.focus();
        } else if (visitDetails.purpose === "Other" && !visitDetails.otherPurpose.trim()) {
          otherPurposeRef.current?.focus();
        }
      }
      if (index === 4) {
        consentCheckboxRef.current?.focus();
      }
    },
    [identity.fullName, visitDetails.meetingWith, visitDetails.otherPurpose, visitDetails.purpose],
  );

  const highlightSection = useCallback((index: number) => {
    setHighlightedSection(index);
    setTimeout(() => setHighlightedSection(null), 1400);
  }, []);

  const isSectionComplete = useCallback(
    (index: number) => {
      if (index === 0) return identityComplete;
      if (index === 1) return visitDetailsComplete;
      if (index === 2) return true;
      if (index === 3) return selfieComplete;
      if (index === 4) return consentComplete;
      return false;
    },
    [identityComplete, visitDetailsComplete, selfieComplete, consentComplete],
  );

  const handleInvalidSection = useCallback(
    (index: number) => {
      scrollToSection(index);
      highlightSection(index);
      focusSectionInput(index);
      setValidationMessage("Please fill the highlighted section before moving on.");
    },
    [focusSectionInput, highlightSection, scrollToSection],
  );

  const firstIncompleteSection = useMemo(() => [0, 1, 2, 3, 4].find((index) => !isSectionComplete(index)), [isSectionComplete]);

  const startCamera = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraError("Camera access is not supported on this device.");
      return;
    }

    if (!window.isSecureContext) {
      setCameraState("error");
      setCameraError("Camera requires a secure (HTTPS) context. Please switch to a secure connection.");
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCameraState("starting");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = mediaStream;
      setCameraState("active");
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => undefined);
      }
    } catch (error) {
      const message =
        error instanceof DOMException
          ? error.name === "NotAllowedError" || error.name === "SecurityError"
            ? "Camera permission was denied. Click 'Enable camera' to retry."
            : error.name === "NotFoundError"
              ? "No camera devices detected."
              : "Unable to start the camera at this time."
          : "Camera stream failed to load.";
      setCameraState("error");
      setCameraError(message);
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    updateSelfie(dataUrl);
  }, [updateSelfie]);

  const handleRetake = useCallback(() => {
    updateSelfie(null);
    startCamera();
  }, [startCamera, updateSelfie]);

  const handleSubmit = useCallback(() => {
    if (!isAllComplete) {
      if (firstIncompleteSection !== undefined) {
        handleInvalidSection(firstIncompleteSection);
      }
      return;
    }
    setValidationMessage(null);
    markSubmitted();
    router.push("/visitor/thanks");
  }, [firstIncompleteSection, handleInvalidSection, isAllComplete, markSubmitted, router]);

  const handleNext = useCallback(() => {
    console.log("Next clicked", activeSection);
    setValidationMessage(null);
    if (!isAllComplete) {
      if (firstIncompleteSection !== undefined) {
        handleInvalidSection(firstIncompleteSection);
        return;
      }
    }
    if (isAllComplete) {
      handleSubmit();
      return;
    }
    const nextIndex = Math.min(activeSection + 1, sectionLabels.length - 1);
    scrollToSection(nextIndex);
    setActiveSection(nextIndex);
  }, [
    activeSection,
    firstIncompleteSection,
    handleInvalidSection,
    handleSubmit,
    isAllComplete,
    scrollToSection,
  ]);

  const handleBack = useCallback(() => {
    const prevIndex = Math.max(0, activeSection - 1);
    scrollToSection(prevIndex);
  }, [activeSection, scrollToSection]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const timer = window.setTimeout(() => setIsSecureContext(window.isSecureContext), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    if (typeof window !== "undefined") {
      timer = window.setTimeout(startCamera, 0);
    }
    return () => {
      if (typeof window !== "undefined" && timer) {
        window.clearTimeout(timer);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [startCamera]);

  useEffect(() => {
    if (!streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    const refs = [identityRef, visitDetailsRef, healthRef, selfieRef, consentRef];
    const observer = new IntersectionObserver(
      (entries) => {
        let bestRatio = 0;
        let bestIndex = -1;
        entries.forEach((entry) => {
          const index = refs.findIndex((ref) => ref.current === entry.target);
          if (index === -1) return;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        });
        if (bestIndex >= 0) {
          setActiveSection(bestIndex);
        }
      },
      { root: container, threshold: [0.25, 0.55, 0.9] },
    );

    refs.forEach((ref) => ref.current && observer.observe(ref.current));
    return () => observer.disconnect();
  }, []);

  const sectionStatus = (index: number) => {
    if (highlightedSection === index) {
      return "border-[#2563EB]";
    }
    if (activeSection === index) {
      return "border-[#2563EB]/40";
    }
    return "border-[#E2E8F0]";
  };

  const hintToneStyles: Record<SmartHint["tone"], string> = {
    info: "border-[#93C5FD]/40 bg-[#EFF6FF]/80",
    warning: "border-[#FDE68A]/40 bg-[#FFFBEB]",
    success: "border-[#A7F3D0]/40 bg-[#DCFCE7]",
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-32">
        <header className="grid gap-5 rounded-[28px] border border-[#E2E8F0] bg-white/70 p-6 shadow-[0_40px_80px_rgba(15,23,42,0.15)] backdrop-blur-3xl lg:grid-cols-[minmax(0,1fr)_200px]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Visitor command center</p>
            <h1 className="text-3xl font-semibold text-[#0F172A]">Premium entrance intelligence</h1>
            <p className="max-w-2xl text-sm text-[#475569]">
              Glance at each phase, trigger camera capture, and steer the flow before you reach the gate.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-[#475569]">
              <span>{`Step ${activeSection + 1} of ${sectionLabels.length}`}</span>
              <span className="h-1 w-1 rounded-full bg-[#475569]" />
              <span>{completionPercent}% complete</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sectionLabels.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(index)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold tracking-[0.4em] uppercase transition ${
                    activeSection === index
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                      : "border-[#E2E8F0] bg-white text-[#94A3B8]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" aria-hidden />
                  {section.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-[20px] border border-white/70 bg-white/60 shadow-[0_25px_60px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <motion.svg viewBox="0 0 160 160" className="h-full w-full">
                <circle
                  cx="80"
                  cy="80"
                  r={progressRadius}
                  stroke="#E2E8F0"
                  strokeWidth="14"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r={progressRadius}
                  stroke="#2563EB"
                  strokeLinecap="round"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={progressCircumference}
                  strokeDashoffset={progressCircumference}
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[0.65rem] uppercase tracking-[0.4em] text-[#94A3B8]">ready</span>
                <span className="text-3xl font-semibold text-[#2563EB]">{completionPercent}%</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-wrap gap-3 rounded-[20px] border border-[#E2E8F0] bg-white/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#475569] shadow-sm">
          <Link href="/" className="rounded-full border border-[#CBD5E1] px-4 py-2 text-[0.65rem] text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]">
            Back to landing
          </Link>
          <Link href="/visitor/thanks" className="rounded-full border border-[#2563EB] px-4 py-2 text-[0.65rem] text-[#2563EB] transition hover:bg-[#EFF6FF]">
            Next: Thanks
          </Link>
          <Link href="/" className="rounded-full border border-[#CBD5E1] px-4 py-2 text-[0.65rem] text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]">
            Exit
          </Link>
        </div>

        {validationMessage && (
          <div className="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-3 text-sm font-semibold text-[#B91C1C]">
            {validationMessage}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-4">
              <ScrollPanel
                ref={scrollContainerRef}
                panelStyle={{ height: "78vh" }}
              panelClassName="space-y-6 pb-32"
              className="border border-white/70 bg-white/60"
            >
                {sectionLabels.map((section, index) => (
                <motion.section
                  key={section.id}
                  ref={
                    index === 0
                      ? identityRef
                      : index === 1
                        ? visitDetailsRef
                        : index === 2
                          ? healthRef
                          : index === 3
                            ? selfieRef
                            : consentRef
                  }
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={sectionVariants}
                  className={`relative overflow-hidden rounded-[28px] border ${sectionStatus(index)} bg-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-3xl`}
                >
                  <motion.div
                    animate={
                      highlightedSection === index
                        ? { x: [0, -5, 5, -5, 5, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.45 }}
                    className="relative h-full"
                  >
                    {activeSection === index && (
                      <motion.span
                        className="pointer-events-none absolute inset-0 rounded-[28px]"
                        animate={{
                          boxShadow: [
                            "0 0 0px rgba(37,99,235,0)",
                            "0 0 30px rgba(37,99,235,0.25)",
                            "0 0 0px rgba(37,99,235,0)",
                          ],
                        }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <GlassPanel className="space-y-5 bg-white/60 px-6 py-6">
                      {index === 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Identity</p>
                              <h2 className="text-xl font-semibold text-[#0F172A]">Visitor identity</h2>
                            </div>
                            <motion.span
                              className="text-xs font-semibold uppercase tracking-[0.4em] text-[#2563EB]"
                              animate={{ scale: [0.95, 1.05, 0.95] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            >
                              Proactive
                            </motion.span>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
                              <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Full name</span>
                              <input
                                ref={fullNameRef}
                                className="w-full rounded-[14px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                                value={identity.fullName}
                                onChange={(event) => updateIdentity({ fullName: event.target.value })}
                                placeholder="Avery Lane"
                              />
                            </label>
                            <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
                              <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Mobile</span>
                              <input
                                ref={mobileRef}
                                type="tel"
                                className="w-full rounded-[14px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                                value={identity.mobile}
                                onChange={(event) => updateIdentity({ mobile: event.target.value })}
                                placeholder="+1 555 012 345"
                              />
                            </label>
                          </div>
                          <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
                            <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Company (optional)</span>
                            <input
                              className="w-full rounded-[14px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                              value={identity.company}
                              onChange={(event) => updateIdentity({ company: event.target.value })}
                              placeholder="Northwind Logistics"
                            />
                          </label>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Switch
                              label="Require escort"
                              description="Notify the safety team if an escort is mandated."
                              checked={identity.escortRequired}
                              onCheckedChange={(value) => updateIdentity({ escortRequired: value })}
                            />
                            <Switch
                              label="SMS updates"
                              description="Receive gate alerts and arrival confirmations."
                              checked={identity.alertsOptIn}
                              onCheckedChange={(value) => updateIdentity({ alertsOptIn: value })}
                            />
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Visit details</p>
                              <h2 className="text-xl font-semibold text-[#0F172A]">Purpose & host</h2>
                            </div>
                            <span className="text-xs text-[#475569]">Priority {visitDetails.priority}%</span>
                          </div>
                          <RadioGroup
                            label="Purpose"
                            value={visitDetails.purpose}
                            options={purposeOptions}
                            onValueChange={(value) => updateVisitDetails({ purpose: value })}
                          />
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
                              <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Meeting with</span>
                              <input
                                ref={meetingRef}
                                className="w-full rounded-[14px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                                value={visitDetails.meetingWith}
                                onChange={(event) => updateVisitDetails({ meetingWith: event.target.value })}
                                placeholder="Avery Lane"
                              />
                            </label>
                            <Select
                              label="Preferred entry lane"
                              value={visitDetails.entryLane}
                              options={entryLaneOptions}
                              onChange={(event) => updateVisitDetails({ entryLane: event.target.value })}
                            />
                          </div>
                          {visitDetails.purpose === "Other" && (
                            <label className="grid gap-2 text-sm font-semibold text-[#0F172A]">
                              <span className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Other purpose</span>
                              <input
                                ref={otherPurposeRef}
                                className="w-full rounded-[14px] border border-[#E2E8F0] bg-white/80 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                                value={visitDetails.otherPurpose}
                                onChange={(event) => updateVisitDetails({ otherPurpose: event.target.value })}
                                placeholder="Describe reason"
                              />
                            </label>
                          )}
                          <div className="space-y-2 rounded-[20px] border border-[#E2E8F0] bg-white/60 px-4 py-3 shadow-inner">
                            <div className="flex items-center justify-between text-sm font-semibold text-[#0F172A]">
                              <span>Urgency slider</span>
                              <span className="text-xs text-[#475569]">{visitDetails.priority}% priority</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={visitDetails.priority}
                              onChange={(event) => updateVisitDetails({ priority: Number(event.target.value) })}
                              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#2563EB]/25 via-[#60A5FA]/60 to-[#F472B6]/30 accent-[#2563EB]"
                            />
                            <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.4em] text-[#94A3B8]">
                              <span>Routine</span>
                              <span>Priority</span>
                              <span>Critical</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Health</p>
                              <h2 className="text-xl font-semibold text-[#0F172A]">Questionnaire</h2>
                            </div>
                            {healthAlert && (
                              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#92400E]">Alert active</span>
                            )}
                          </div>
                          <div className="space-y-3">
                            {healthQuestions.map((question) => {
                              const value = health[question];
                              return (
                                <div
                                  key={question}
                                  className="flex flex-col gap-2 rounded-[18px] border border-[#E2E8F0] bg-white/80 px-4 py-3 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-[#0F172A]">{question}</p>
                                      <p className="text-[0.65rem] text-[#475569]">Select yes or no</p>
                                    </div>
                                    <div className="flex gap-2">
                                      {["yes", "no"].map((option) => {
                                        const isYes = option === "yes";
                                        const active = isYes ? value : !value;
                                        return (
                                          <button
                                            key={option}
                                            type="button"
                                            onClick={() => updateHealth(question, isYes)}
                                            className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] transition ${
                                              active
                                                ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                                                : "border-[#E2E8F0] bg-white text-[#475569]"
                                            }`}
                                          >
                                            {option}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {healthAlert && (
                              <div className="rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm font-semibold text-[#92400E]">
                                Entry to production may require a HACCP review. Notify your host immediately.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {index === 3 && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Selfie</p>
                              <h2 className="text-xl font-semibold text-[#0F172A]">Selfie capture</h2>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDialogOpen(true)}
                              className="text-xs font-semibold text-[#2563EB] underline-offset-4 hover:underline"
                            >
                              Capture guide
                            </button>
                          </div>
                          {!isSecureContext && (
                            <div className="rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
                              Camera access requires HTTPS. Run the flow from a secure context.
                            </div>
                          )}
                          {cameraError && (
                            <div className="rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
                              {cameraError}
                            </div>
                          )}
                          <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-[#0F172A]/5">
                            {selfie.snapshot ? (
                              <Image
                                src={selfie.snapshot}
                                alt="Visitor selfie"
                                fill
                                sizes="(max-width: 768px) 100vw, 360px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={handleCapture}
                              disabled={cameraState !== "active"}
                              className="rounded-[14px] bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-[0_15px_35px_rgba(37,99,235,0.35)] transition hover:translate-y-0.5 hover:shadow-[0_25px_60px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:text-[#94A3B8]"
                            >
                              Capture
                            </button>
                            <button
                              type="button"
                              onClick={handleRetake}
                            disabled={!selfie.snapshot}
                              className="rounded-[14px] border border-[#CBD5E1] bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40"
                            >
                              Retake
                            </button>
                            {cameraState !== "active" && (
                              <button
                                type="button"
                                onClick={startCamera}
                                className="rounded-[14px] border border-[#E2E8F0] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#475569] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                              >
                                Enable camera
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {index === 4 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Consent</p>
                              <h2 className="text-xl font-semibold text-[#0F172A]">Consent & review</h2>
                            </div>
                            <button
                              type="button"
                              onClick={() => setGuidelinesOpen(true)}
                              className="text-xs font-semibold text-[#2563EB] underline-offset-4 hover:underline"
                            >
                              Site norms
                            </button>
                          </div>
                          <label className="flex items-start gap-3 rounded-[18px] border border-[#E2E8F0] bg-white/80 px-4 py-3">
                            <input
                              ref={consentCheckboxRef}
                              type="checkbox"
                              checked={consent}
                              onChange={(event) => updateConsent(event.target.checked)}
                              className="mt-1 h-5 w-5 rounded border border-[#E2E8F0] text-[#2563EB] focus:ring-[#93C5FD]"
                            />
                            <span className="text-sm text-[#475569]">
                              I consent to my photo and visit details being recorded for badge issuance and safety oversight.
                            </span>
                          </label>
                          <p className="text-xs text-[#94A3B8]">Consent must be granted before the submit action becomes available.</p>
                        </div>
                      )}
                    </GlassPanel>
                  </motion.div>
                </motion.section>
              ))}
            </ScrollPanel>
          </div>

          <aside className="hidden flex-col gap-4 lg:flex">
            <GlassPanel className={`space-y-3 ${hintToneStyles[smartHint.tone]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#475569]">AI hints</p>
                  <h3 className="text-lg font-semibold text-[#0F172A]">{smartHint.title}</h3>
                </div>
                <motion.span className="h-3 w-3 rounded-full bg-[#2563EB]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
              </div>
              <p className="text-sm text-[#475569]">{smartHint.detail}</p>
              <button
                type="button"
                onClick={() => scrollToSection(smartHint.sectionIndex)}
                className="w-full rounded-[14px] border border-[#CBD5E1] bg-white/70 px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                {smartHint.buttonLabel}
              </button>
            </GlassPanel>
            <GlassPanel className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Section tracker</p>
                <span className="text-xs text-[#475569]">Tap to jump</span>
              </div>
              <div className="space-y-2">
                {sectionLabels.map((section, index) => {
                  const complete = isSectionComplete(index);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(index)}
                      className={`flex w-full items-center justify-between rounded-[16px] border px-3 py-2 text-left text-sm text-[#0F172A] transition ${
                        activeSection === index ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${complete ? "bg-[#16A34A]" : "bg-[#E2E8F0]"}`} />
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Step {index + 1}</p>
                          <p className="font-semibold text-[#0F172A]">{section.label}</p>
                        </div>
                      </div>
                      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-[#94A3B8]">
                        {complete ? "Done" : "Open"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlassPanel>
          </aside>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Capture guide">
        <p className="text-sm text-[#475569]">
          Center your face, keep a neutral expression, and ensure even lighting. Retake as needed for clarity.
        </p>
      </Dialog>
      <Sheet open={guidelinesOpen} onOpenChange={setGuidelinesOpen} title="Site norms">
        <div className="space-y-3 text-sm text-[#475569]">
          <p>Wear your badge visibly at all times.</p>
          <p>Respect PPE zones and stay with your escort.</p>
          <p>Report unusual sights or spills immediately.</p>
        </div>
      </Sheet>

      <footer className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-auto">
        <div className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-[24px] border border-[#E2E8F0] bg-white/80 px-5 py-4 shadow-[0_35px_90px_rgba(15,23,42,0.25)] backdrop-blur-3xl">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeSection === 0}
            className="rounded-[14px] border border-[#CBD5E1] px-5 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-[#0F172A] transition hover:border-[#2563EB] disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={activeSection === sectionLabels.length - 1 && !isAllComplete}
            className="rounded-[14px] bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-6 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-[0_15px_45px_rgba(37,99,235,0.35)] transition hover:translate-y-0.5 hover:shadow-[0_25px_60px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
          >
            {isAllComplete ? "Submit" : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );
}
