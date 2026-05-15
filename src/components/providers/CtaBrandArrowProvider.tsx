"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { WpImage } from "@/types/wordpress";

const CtaBrandArrowContext = createContext<WpImage | null>(null);

export function CtaBrandArrowProvider({
  image,
  children,
}: {
  image: WpImage;
  children: ReactNode;
}) {
  return <CtaBrandArrowContext.Provider value={image}>{children}</CtaBrandArrowContext.Provider>;
}

/** Resolved default icon for `variant="ctaBrand"` pills (from Site Options + fallback). */
export function useCtaBrandArrowImage(): WpImage | null {
  return useContext(CtaBrandArrowContext);
}
