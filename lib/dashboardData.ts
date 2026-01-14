import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  LayoutDashboard,
  Radio,
  Signal,
  Settings,
  Sparkles,
} from "lucide-react";

export type KpiStat = {
  label: string;
  value: number;
  delta: string;
};

export type FeedItem = {
  name: string;
  status: "Allowed" | "Blocked" | "Pending";
  purpose: string;
  time: string;
};

export type IconRailItem = {
  label: string;
  icon: LucideIcon;
};

export const liveFeed: FeedItem[] = [
  { name: "Jordan Ellis", status: "Allowed", purpose: "Audit Walk", time: "09:12 AM" },
  { name: "Monica Rios", status: "Blocked", purpose: "Delivery", time: "09:07 AM" },
  { name: "Miles Ortega", status: "Pending", purpose: "Contractor", time: "08:59 AM" },
  { name: "Serena Patel", status: "Allowed", purpose: "Inspection", time: "08:43 AM" },
  { name: "Liam Carter", status: "Allowed", purpose: "Meeting", time: "08:27 AM" },
  { name: "Priya Desai", status: "Allowed", purpose: "Maintenance", time: "08:11 AM" },
  { name: "Nadia Brooks", status: "Blocked", purpose: "Interview", time: "07:58 AM" },
  { name: "Owen Reed", status: "Pending", purpose: "Vendor", time: "07:45 AM" },
];

export const railIcons: IconRailItem[] = [
  { label: "Pulse", icon: LayoutDashboard },
  { label: "Signal", icon: Signal },
  { label: "Beacon", icon: Sparkles },
  { label: "Radiant", icon: Radio },
  { label: "Cloud", icon: Cloud },
  { label: "Control", icon: Settings },
];
