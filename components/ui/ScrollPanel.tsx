"use client";

import { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type ScrollPanelProps = {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
};

export const ScrollPanel = forwardRef<HTMLDivElement, ScrollPanelProps>(
  ({ children, className = "", panelClassName = "", panelStyle }, ref) => (
    <div
      className={`relative w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_30px_80px_rgba(15,23,42,0.15)] backdrop-blur-3xl ${className}`}
    >
      <div
        ref={ref}
        style={panelStyle}
        className={`custom-scrollbar h-full w-full overflow-y-auto px-5 py-6 ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  ),
);

ScrollPanel.displayName = "ScrollPanel";
