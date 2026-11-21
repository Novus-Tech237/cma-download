# CMA HMS downloads

The page where the Centre Médical AFUNA staff download the CMA HMS apps:
the Windows installer and, once it is signed, the Android APK. French at `/`,
English at `/en`. The apps themselves are built in `../cma-hms` (its
`src-tauri/README.md` and `docs/deployment.md`).

## Publishing a release

1. In cma-hms, build the apps: `npm run desktop:build`, and
   `npm run android:build` once the Android upload key exists.
2. Here:

   ```sh
   pnpm release:sync
   ```

   It reads the version from cma-hms's `src-tauri/tauri.conf.json`, copies
   that version's builds into `public/downloads/` and writes
   `lib/release.json` (version, sizes, SHA-256, build dates, whether the
   installer is signed). The page reads only that file.
3. Build and deploy this site with the new files in `public/downloads/`.

Options: `pnpm release:sync C:\path\to\cma-hms` (or `CMA_HMS_DIR`) when
cma-hms is not next to this folder; `--no-android` to publish Windows alone.

What the script refuses, so the page never offers a build that will not
install or is not the version shown:

- no Windows installer for the current version: build it first;
- an APK that is debuggable, or whose version is not the one in
  `tauri.conf.json` (read from the APK with the Android SDK's `aapt2`).

An unsigned APK (`app-universal-release-unsigned.apk`) is skipped, and the
page shows Android as coming soon, with the steps to install the site from
the browser instead.

`public/downloads/` belongs to the script: it is emptied on every run, so
only the current version is offered. Keep older builds in cma-hms's releases
folder for rollback (deployment.md, step 6).

## What the page adapts

- **Android card:** a download when `release.json` has an APK, otherwise
  "coming soon" and the browser install steps.
- **SmartScreen step:** shown only while the Windows installer is unsigned.
- **"For this device":** the card matching the visitor's system is marked; on
  a device with no app (iPhone, Mac, Linux) a note points to the site. This
  is the only part that runs in the browser (`components/device.tsx`).

## Code

| Path | Holds |
| --- | --- |
| `scripts/sync-release.mjs` | Copies the builds from cma-hms, writes `lib/release.json` |
| `lib/release.json`, `lib/release.ts` | The published release, and its type |
| `lib/copy.ts` | Every visible string, French and English (same keys, checked by `tsc`) |
| `components/download-page.tsx` | The page, for both languages |
| `app/page.tsx`, `app/en/page.tsx` | `/` and `/en` |

The brand colour scale and typefaces are the HMS's (cma-hms `app/globals.css`).
The page is static: `pnpm build` prerenders both languages.

## Commands

- `pnpm dev` — development server on http://localhost:3000
- `pnpm build`, `pnpm start` — production build and server
- `pnpm lint`, `npx tsc --noEmit`
- `pnpm release:sync` — publish the current cma-hms builds
