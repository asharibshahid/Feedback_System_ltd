"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export const healthQuestions = [
  "Diarrhea",
  "Vomiting",
  "Influenza",
  "Ear, Nose, Throat infections",
  "Skin rashes",
  "Recurring boils",
];

type HealthState = Record<typeof healthQuestions[number], boolean>;

type Identity = {
  fullName: string;
  mobile: string;
  company: string;
  escortRequired: boolean;
  alertsOptIn: boolean;
};

type VisitDetails = {
  purpose: string;
  otherPurpose: string;
  meetingWith: string;
  date: string;
  priority: number;
  entryLane: string;
};

type SelfieState = {
  snapshot: string | null;
};

type VisitorFlowContextValue = {
  identity: Identity;
  visitDetails: VisitDetails;
  health: HealthState;
  selfie: SelfieState;
  consent: boolean;
  submitted: boolean;
  updateIdentity: (payload: Partial<Identity>) => void;
  updateVisitDetails: (payload: Partial<VisitDetails>) => void;
  updateHealth: (question: keyof HealthState, value: boolean) => void;
  updateSelfie: (snapshot: string | null) => void;
  updateConsent: (value: boolean) => void;
  markSubmitted: () => void;
};

const defaultHealthState: HealthState = healthQuestions.reduce(
  (acc, question) => ({ ...acc, [question]: false }),
  {} as HealthState,
);

const defaultIdentity: Identity = {
  fullName: "",
  mobile: "",
  company: "",
  escortRequired: false,
  alertsOptIn: true,
};

const defaultVisitDetails: VisitDetails = {
  purpose: "Meeting",
  otherPurpose: "",
  meetingWith: "",
  date: new Date().toISOString(),
  priority: 48,
  entryLane: "North Gate",
};

const defaultSelfieState: SelfieState = {
  snapshot: null,
};

const VisitorFlowContext = createContext<VisitorFlowContextValue | undefined>(undefined);

export function VisitorFlowProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity>(defaultIdentity);
  const [visitDetails, setVisitDetails] = useState<VisitDetails>(defaultVisitDetails);
  const [health, setHealth] = useState<HealthState>(defaultHealthState);
  const [selfie, setSelfie] = useState<SelfieState>(defaultSelfieState);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const value = useMemo(
    () => ({
      identity,
      visitDetails,
      health,
      selfie,
      consent,
      submitted,
      updateIdentity: (payload: Partial<Identity>) =>
        setIdentity((prev) => ({ ...prev, ...payload })),
      updateVisitDetails: (payload: Partial<VisitDetails>) =>
        setVisitDetails((prev) => ({ ...prev, ...payload })),
      updateHealth: (question: keyof HealthState, value: boolean) =>
        setHealth((prev) => ({ ...prev, [question]: value })),
      updateSelfie: (snapshot: string | null) => setSelfie({ snapshot }),
      updateConsent: (value: boolean) => setConsent(value),
      markSubmitted: () => setSubmitted(true),
    }),
    [identity, visitDetails, health, selfie, consent, submitted],
  );

  return <VisitorFlowContext.Provider value={value}>{children}</VisitorFlowContext.Provider>;
}

export function useVisitorFlow() {
  const context = useContext(VisitorFlowContext);
  if (!context) {
    throw new Error("useVisitorFlow must be used within VisitorFlowProvider");
  }
  return context;
}
