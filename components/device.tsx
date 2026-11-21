"use client";

import { useSyncExternalStore, type ReactNode } from "react";

/** The platforms CMA HMS ships an app for, and everything else. */
export type Platform = "windows" | "android" | "other";

function detect(): Platform {
  const ua = navigator.userAgent;
  // Before Windows: some Android browsers mention other systems in their UA.
  if (/Android/i.test(ua)) return "android";
  if (/Windows NT/i.test(ua)) return "windows";
  return "other";
}

// The platform never changes while the page is open.
const subscribe = () => () => {};

/**
 * The visitor's platform. Null on the server and during hydration, so the
 * prerendered page shows no device hint, then the browser fills it in.
 */
function usePlatform(): Platform | null {
  return useSyncExternalStore(subscribe, detect, () => null);
}

/** A pill on the download card that matches the visitor's device. */
export function ForThisDevice({ platform, label }: { platform: Platform; label: string }) {
  if (usePlatform() !== platform) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
      <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
      {label}
    </span>
  );
}

/** Shown only on devices with no app (iPhone, Mac, Linux…). */
export function OtherDeviceNotice({ children }: { children: ReactNode }) {
  if (usePlatform() !== "other") return null;
  return <>{children}</>;
}
