# CMA HMS downloads

The page where the Centre Médical AFUNA staff download the CMA HMS apps:
the Windows installer and the Android APK. French at `/`, English at `/en`.
The apps themselves are built in the cma-hms repository (its
`src-tauri/README.md` and `docs/deployment.md`).

## Where the downloads come from

Nothing to do here when a new version is released.

1. In cma-hms, `version` is raised in `src-tauri/tauri.conf.json` and merged
   to `master`.
2. Its workflow (`.github/workflows/app-release.yml`) builds Windows and
   Android and publishes release `v<version>` in the public
   `Novus-Tech237/cma-hms-releases` repository, with a `release.json`
   describing the files (written by cma-hms's `scripts/app-release.mjs`).
3. This page reads
   `https://github.com/Novus-Tech237/cma-hms-releases/releases/latest/download/release.json`
   (`lib/release.ts`), and links to the files in that release. The answer is
   cached and refreshed in the background, so a new version shows within
   about ten minutes, without a redeploy.

`release.json` is checked before use: the version, sizes, checksums, and
every link must point into that release. If there is no release yet, or
GitHub cannot be reached, the page says the downloads are unavailable for
now and points to the website; it tries again a minute later.

Another releases repository: set `CMA_RELEASES_REPO` (`owner/name`) in the
Vercel project's environment variables.

## What the page adapts

- **Android card:** a download when the release has an APK, otherwise "coming
  soon" and the steps to install the site from the browser.
- **SmartScreen step:** shown only while the Windows installer is unsigned.
- **"For this device":** the card matching the visitor's system is marked; on
  a device with no app (iPhone, Mac, Linux) a note points to the site. This
  is the only part that runs in the browser (`components/device.tsx`).

## Code

| Path | Holds |
| --- | --- |
| `lib/release.ts` | Reads, checks and caches the latest release's `release.json` |
| `lib/copy.ts` | Every visible string, French and English (same keys, checked by `tsc`) |
| `components/download-page.tsx` | The page, for both languages |
| `app/page.tsx`, `app/en/page.tsx` | `/` and `/en` |

The brand colour scale and typefaces are the HMS's (cma-hms `app/globals.css`).
The page is prerendered, then refreshed with the release as above.

## Commands

- `pnpm dev` — development server on http://localhost:3000
- `pnpm build`, `pnpm start` — production build and server
- `pnpm lint`, `npx tsc --noEmit`
