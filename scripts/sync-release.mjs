/**
 * Publishes the current CMA HMS app builds on this site.
 *
 * Reads the version from cma-hms (src-tauri/tauri.conf.json), copies that
 * version's builds into public/downloads/ and writes lib/release.json, which
 * the page reads. public/downloads/ belongs to this script: it is emptied on
 * every run, so only the current version is offered.
 *
 *   pnpm release:sync                      cma-hms next to this folder
 *   pnpm release:sync C:\path\to\cma-hms   or CMA_HMS_DIR=...
 *   pnpm release:sync --no-android         publish Windows alone
 *
 * Builds, made in cma-hms (its docs/deployment.md):
 *   Windows  npm run desktop:build  →  src-tauri/target/release/bundle/nsis/CMA HMS_<version>_x64-setup.exe
 *            Required.
 *   Android  npm run android:build  →  …/outputs/apk/universal/release/app-universal-release.apk
 *            Optional. Without a signed release APK, the page shows Android as
 *            coming soon. A debug APK, an unsigned one, or one built for
 *            another version is never published.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const noAndroid = args.includes("--no-android");
const hmsArg = args.find((a) => !a.startsWith("--"));
const hms = path.resolve(hmsArg ?? process.env.CMA_HMS_DIR ?? path.join(root, "..", "cma-hms"));

const outDir = path.join(root, "public", "downloads");
const manifestPath = path.join(root, "lib", "release.json");

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

// ── The version ──────────────────────────────────────────────────────────────
const confPath = path.join(hms, "src-tauri", "tauri.conf.json");
if (!existsSync(confPath)) {
  fail(`No cma-hms at ${hms} (no src-tauri/tauri.conf.json).\n  Pass its folder as an argument, or set CMA_HMS_DIR.`);
}
const conf = JSON.parse((await readFile(confPath, "utf8")).replace(/^\uFEFF/, ""));
const { version, productName } = conf;
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) fail(`tauri.conf.json has no usable version (${version}).`);
const webApp = conf.build?.frontendDist;
if (!/^https:\/\//.test(webApp ?? "")) fail(`tauri.conf.json build.frontendDist is not an https URL (${webApp}).`);

// ── Windows ──────────────────────────────────────────────────────────────────
const nsisDir = path.join(hms, "src-tauri", "target", "release", "bundle", "nsis");
const exeSrc = path.join(nsisDir, `${productName}_${version}_x64-setup.exe`);
if (!existsSync(exeSrc)) {
  const found = existsSync(nsisDir) ? (await readdir(nsisDir)).filter((f) => f.endsWith(".exe")) : [];
  fail(
    `No Windows installer for version ${version}:\n  ${exeSrc}\n` +
      (found.length ? `  Found instead: ${found.join(", ")}\n` : "") +
      `  Run \`npm run desktop:build\` in cma-hms first.`,
  );
}

/** Authenticode status, from Windows itself. Anything but a valid signature counts as unsigned. */
function isSigned(file) {
  if (process.platform !== "win32") return false;
  try {
    const status = execFileSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", `(Get-AuthenticodeSignature -LiteralPath '${file.replace(/'/g, "''")}').Status`],
      { encoding: "utf8" },
    );
    return status.trim() === "Valid";
  } catch {
    return false;
  }
}

// ── Android ──────────────────────────────────────────────────────────────────
const apkDir = path.join(hms, "src-tauri", "gen", "android", "app", "build", "outputs", "apk", "universal", "release");
const apkSrc = path.join(apkDir, "app-universal-release.apk");

/** aapt2 from the newest Android build-tools, or null. */
function findAapt2() {
  const sdks = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Android", "Sdk")];
  for (const sdk of sdks.filter(Boolean)) {
    const tools = path.join(sdk, "build-tools");
    if (!existsSync(tools)) continue;
    const versions = readdirSync(tools).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const v of versions) {
      const exe = path.join(tools, v, process.platform === "win32" ? "aapt2.exe" : "aapt2");
      if (existsSync(exe)) return exe;
    }
  }
  return null;
}

let useApk = false;
if (noAndroid) {
  console.log("• Android: left out (--no-android).");
} else if (existsSync(apkSrc)) {
  const aapt2 = findAapt2();
  if (!aapt2) {
    console.warn("! Android: no aapt2 found (Android SDK build-tools), so the APK's version was not checked.");
  } else {
    const badging = execFileSync(aapt2, ["dump", "badging", apkSrc], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const apkVersion = badging.match(/versionName='([^']*)'/)?.[1];
    if (/^application-debuggable/m.test(badging)) fail(`The APK is a debuggable build and cannot be published:\n  ${apkSrc}`);
    if (apkVersion !== version) {
      fail(
        `The APK is version ${apkVersion}, but tauri.conf.json says ${version}:\n  ${apkSrc}\n` +
          `  Run \`npm run android:build\` in cma-hms, or publish Windows alone with --no-android.`,
      );
    }
  }
  useApk = true;
} else if (existsSync(path.join(apkDir, "app-universal-release-unsigned.apk"))) {
  console.warn("! Android: only an unsigned APK was built (no keystore.properties in cma-hms). Android is shown as coming soon.");
} else {
  console.log("• Android: no release APK built yet. Android is shown as coming soon.");
}

// ── Copy and describe ────────────────────────────────────────────────────────
async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

async function publish(src, name) {
  await copyFile(src, path.join(outDir, name));
  const info = await stat(src);
  return {
    url: `/downloads/${name}`,
    name,
    size: info.size,
    sha256: await sha256(src),
    builtAt: info.mtime.toISOString(),
  };
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const windows = {
  ...(await publish(exeSrc, `cma-hms-${version}-windows-x64-setup.exe`)),
  signed: isSigned(exeSrc),
};
const android = useApk ? await publish(apkSrc, `cma-hms-${version}-android.apk`) : null;

const release = { version, webApp, windows, android };
await writeFile(manifestPath, `${JSON.stringify(release, null, 2)}\n`);

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
console.log(`\n✓ CMA HMS ${version} published in public/downloads/`);
console.log(`  Windows  ${windows.name}  ${mb(windows.size)}  ${windows.signed ? "signed" : "unsigned"}`);
console.log(`  Android  ${android ? `${android.name}  ${mb(android.size)}` : "coming soon"}`);
console.log(`  lib/release.json written. Rebuild or redeploy the site to show it.\n`);
