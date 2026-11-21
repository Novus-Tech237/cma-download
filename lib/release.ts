import { cacheLife } from "next/cache";

/** The site the apps load: what the page's "Ouvrir CMA HMS" opens. */
export const WEB_APP = "https://erp.afuna-clinic.org";

/**
 * The public repository cma-hms's release workflow publishes to
 * (cma-hms/.github/workflows/app-release.yml). Override with CMA_RELEASES_REPO.
 */
const RELEASES_REPO = process.env.CMA_RELEASES_REPO || "Novus-Tech237/cma-hms-releases";

/** One published build, as cma-hms's scripts/app-release.mjs describes it in release.json. */
export type ReleaseFile = {
  /** Its address in the release, under the version's tag. */
  url: string;
  name: string;
  /** Bytes. */
  size: number;
  sha256: string;
  /** When the release was published (ISO 8601). */
  builtAt: string;
};

export type Release = {
  version: string;
  windows: ReleaseFile & {
    /** Has a valid Authenticode signature; if not, Windows SmartScreen warns. */
    signed: boolean;
  };
  /** Null when the release has no APK (no upload key in the workflow). */
  android: ReleaseFile | null;
};

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => typeof value === "object" && value !== null;

/** A file of the release, or null if anything is off, a link outside the release above all. */
function parseFile(value: unknown, prefix: string): ReleaseFile | null {
  if (!isObject(value)) return null;
  const { url, name, size, sha256, builtAt } = value;
  if (typeof url !== "string" || !url.startsWith(prefix)) return null;
  if (typeof name !== "string" || typeof size !== "number" || size <= 0) return null;
  if (typeof sha256 !== "string" || !/^[0-9a-f]{64}$/.test(sha256)) return null;
  if (typeof builtAt !== "string" || Number.isNaN(Date.parse(builtAt))) return null;
  return { url, name, size, sha256, builtAt };
}

function parseRelease(value: unknown): Release | null {
  if (!isObject(value)) return null;
  const { version } = value;
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) return null;
  const prefix = `https://github.com/${RELEASES_REPO}/releases/download/v${version}/`;
  const windows = parseFile(value.windows, prefix);
  if (!windows) return null;
  return {
    version,
    windows: { ...windows, signed: isObject(value.windows) && value.windows.signed === true },
    android: parseFile(value.android, prefix),
  };
}

/**
 * The latest release, from its release.json. Null when there is none yet or
 * GitHub cannot be reached: the page then points to the website instead.
 *
 * Cached, and refreshed in the background, so a new release shows here
 * within about ten minutes of being published, without a redeploy. A miss is
 * kept for a minute only.
 */
export async function getRelease(): Promise<Release | null> {
  "use cache";
  try {
    const response = await fetch(`https://github.com/${RELEASES_REPO}/releases/latest/download/release.json`, {
      signal: AbortSignal.timeout(10_000),
    });
    const release = response.ok ? parseRelease(await response.json()) : null;
    if (release) {
      cacheLife({ stale: 300, revalidate: 600, expire: 86_400 });
      return release;
    }
  } catch {
    // Unreachable, or not JSON: as if there were no release yet.
  }
  cacheLife("minutes");
  return null;
}
