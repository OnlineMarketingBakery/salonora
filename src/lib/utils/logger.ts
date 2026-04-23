const isDev = process.env.NODE_ENV === "development";

export const logger = {
  warn: (...a: unknown[]) => {
    if (isDev) console.warn("[salonora]", ...a);
  },
  error: (...a: unknown[]) => {
    console.error("[salonora]", ...a);
  },
  info: (...a: unknown[]) => {
    if (isDev) console.info("[salonora]", ...a);
  },
};
