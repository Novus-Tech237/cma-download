import data from "./release.json";

/** One published build, as `scripts/sync-release.mjs` describes it. */
export type ReleaseFile = {
  /** Where this site serves it, under public/downloads/. */
  url: string;
  name: string;
  /** Bytes. */
  size: number;
  sha256: string;
  /** When cma-hms built it (ISO 8601). */
  builtAt: string;
};

export type Release = {
  /** From cma-hms's src-tauri/tauri.conf.json. */
  version: string;
  /** The site the apps load (tauri.conf.json `build.frontendDist`). */
  webApp: string;
  windows: ReleaseFile & {
    /** Has a valid Authenticode signature; if not, Windows SmartScreen warns. */
    signed: boolean;
  };
  /** Null until a signed release APK has been built. */
  android: ReleaseFile | null;
};

/** Written by `pnpm release:sync`. Never edit release.json by hand. */
export const release: Release = data;
