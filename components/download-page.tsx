import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ForThisDevice, OtherDeviceNotice, type Platform } from "@/components/device";
import { AndroidLogo, ArrowRightIcon, DownloadIcon, GlobeIcon, PhoneIcon, WindowsLogo } from "@/components/icons";
import { copy, intlLocale, localePath, TIME_ZONE, type Copy, type Locale } from "@/lib/copy";
import { getRelease, WEB_APP, type Release, type ReleaseFile } from "@/lib/release";
import logo from "@/public/logo.png";

/** The card every block sits in: the HMS's slate-on-white bento card. */
const CARD =
  "rounded-2xl border border-slate-200/70 bg-white/85 shadow-[0_24px_48px_-32px_rgb(15_23_42/0.25)] dark:border-slate-700/50 dark:bg-slate-900/60";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

/** The square a platform's logo sits on, at the top of its card. */
const LOGO_TILE =
  "grid size-12 place-items-center rounded-xl bg-white ring-1 ring-slate-200/80 dark:bg-slate-800/70 dark:ring-slate-700/60";

/** Fills `{slot}` markers in a string with elements. */
function rich(text: string, values: Record<string, ReactNode>): ReactNode {
  return text
    .split(/\{(\w+)\}/)
    .map((part, i) => (i % 2 ? <Fragment key={i}>{values[part]}</Fragment> : part));
}

function formatSize(bytes: number, locale: Locale) {
  const n = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024);
  return `${n} ${copy[locale].megabytes}`;
}

function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeZone: TIME_ZONE }).format(new Date(iso));
}

export async function DownloadPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const release = await getRelease();
  const host = new URL(WEB_APP).host;

  const siteLink = (
    <a
      href={WEB_APP}
      className={`font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:decoration-brand-600 dark:text-brand-300 dark:decoration-brand-700 ${FOCUS}`}
    >
      {host}
    </a>
  );

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <div aria-hidden className="page-backdrop pointer-events-none fixed inset-0 -z-10" />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-5 sm:px-6 sm:pt-7">
        <Link href={localePath[locale]} aria-label={t.home} className={`rounded-lg ${FOCUS}`}>
          <Image src={logo} alt={t.logoAlt} priority className="h-12 w-auto sm:h-14" />
        </Link>
        <LanguageSwitch locale={locale} label={t.language} />
      </header>

      <main lang={locale} className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 sm:px-6">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="max-w-2xl pt-10 pb-10 sm:pt-16 sm:pb-12">
          {release && (
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-brand-50/80 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800/50 dark:bg-brand-950/40 dark:text-brand-300">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              {rich(t.eyebrow, { version: release.version })}
            </p>
          )}
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl dark:text-white">
            {rich(t.title, { app: <span className="text-brand-600 dark:text-brand-400">CMA HMS</span> })}
          </h1>
          <p className="mt-4 text-lg text-pretty text-slate-600 dark:text-slate-300">{t.lead}</p>
          <p className="mt-3 text-sm text-pretty text-slate-500 dark:text-slate-400">
            {rich(t.sameEverywhere, { site: siteLink })}
          </p>

          <OtherDeviceNotice>
            <div className="mt-6 flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
              <GlobeIcon className="mt-0.5 size-5 shrink-0" />
              <p>{rich(t.otherDevice, { site: siteLink })}</p>
            </div>
          </OtherDeviceNotice>
        </section>

        {release ? (
          <ReleaseSections t={t} locale={locale} release={release} siteLink={siteLink} />
        ) : (
          <Unavailable t={t} />
        )}

        {/* ── In the browser ───────────────────────────────────────────── */}
        <section className="mt-16 flex flex-col gap-5 rounded-2xl bg-brand-800 p-6 text-white sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border dark:border-brand-800/60 dark:bg-brand-950/70">
          <div>
            <h2 className="text-xl font-semibold">{t.browser.title}</h2>
            <p className="mt-1.5 text-sm text-brand-100 dark:text-brand-200/80">{t.browser.body}</p>
          </div>
          <a
            href={WEB_APP}
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 focus-visible:outline-white ${FOCUS}`}
          >
            {t.browser.button}
            <ArrowRightIcon className="size-4" />
          </a>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 dark:border-slate-800">
        <p className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500 sm:px-6 dark:text-slate-400">
          {t.footer}
          {release && ` · CMA HMS ${release.version}`}
        </p>
      </footer>
    </div>
  );
}

/** The download cards and the installation steps of a published release. */
function ReleaseSections({
  t,
  locale,
  release,
  siteLink,
}: {
  t: Copy;
  locale: Locale;
  release: Release;
  siteLink: ReactNode;
}) {
  const { windows, android, version } = release;
  const windowsSteps = [
    rich(t.install.windowsSteps.open, { file: <FileName>{windows.name}</FileName> }),
    ...(windows.signed ? [] : [t.install.windowsSteps.smartScreen]),
    t.install.windowsSteps.perUser,
    t.install.windowsSteps.signIn,
  ];

  return (
    <>
      {/* ── Downloads ────────────────────────────────────────────────── */}
      <section aria-label={t.downloads} className="grid gap-5 md:grid-cols-2">
        <DownloadCard
          t={t}
          locale={locale}
          platform="windows"
          icon={<WindowsLogo />}
          name={t.windows.name}
          requirements={t.windows.requirements}
          button={t.windows.button}
          file={windows}
          version={version}
        />
        {android ? (
          <DownloadCard
            t={t}
            locale={locale}
            platform="android"
            icon={<AndroidLogo className="size-7" />}
            name={t.android.name}
            requirements={t.android.requirements}
            button={t.android.button}
            file={android}
            version={version}
          />
        ) : (
          <ComingSoonCard t={t} />
        )}
      </section>

      {/* ── How to install ───────────────────────────────────────────── */}
      <section className="mt-16 sm:mt-20" aria-labelledby="install">
        <h2 id="install" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {t.install.title}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Steps
            icon={<WindowsLogo className="size-5" />}
            title={t.install.windowsTitle}
            steps={windowsSteps}
            notes={t.install.windowsNotes}
          />
          {android ? (
            <Steps
              icon={<AndroidLogo className="size-5" />}
              title={t.install.androidTitle}
              steps={t.install.androidSteps}
              notes={t.install.androidNotes}
            />
          ) : (
            <Steps
              icon={<PhoneIcon />}
              title={t.install.phoneTitle}
              steps={t.install.phoneSteps.map((s) => rich(s, { site: siteLink }))}
              notes={t.install.phoneNotes}
            />
          )}
        </div>
      </section>
    </>
  );
}

/** No release to offer: none published yet, or GitHub out of reach. */
function Unavailable({ t }: { t: Copy }) {
  return (
    <section className={`${CARD} flex gap-4 p-6 sm:p-8`}>
      <span className={`${LOGO_TILE} shrink-0`}>
        <DownloadIcon className="size-6 text-slate-400" />
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t.unavailable.title}</h2>
        <p className="mt-1.5 text-sm text-pretty text-slate-600 dark:text-slate-300">{t.unavailable.body}</p>
      </div>
    </section>
  );
}

function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  return (
    <nav aria-label={label} className="flex rounded-full border border-slate-200/80 bg-white/80 p-1 dark:border-slate-700/60 dark:bg-slate-900/60">
      {(Object.keys(localePath) as Locale[]).map((l) => {
        const current = l === locale;
        return (
          <Link
            key={l}
            href={localePath[l]}
            hrefLang={l}
            lang={l}
            aria-current={current ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${FOCUS} ${
              current
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}

function DownloadCard({
  t,
  locale,
  platform,
  icon,
  name,
  requirements,
  button,
  file,
  version,
}: {
  t: Copy;
  locale: Locale;
  platform: Platform;
  icon: ReactNode;
  name: string;
  requirements: string;
  button: string;
  file: ReleaseFile;
  version: string;
}) {
  return (
    <article className={`${CARD} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-3">
        <span className={LOGO_TILE}>{icon}</span>
        <ForThisDevice platform={platform} label={t.forThisDevice} />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{name}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{requirements}</p>

      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        <Fact label={t.facts.version} value={version} />
        <Fact label={t.facts.size} value={formatSize(file.size, locale)} />
        <Fact label={t.facts.date} value={formatDate(file.builtAt, locale)} />
      </dl>

      <div className="mt-auto pt-6">
        <a
          href={file.url}
          download
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 active:translate-y-px ${FOCUS}`}
        >
          <DownloadIcon className="size-4.5" />
          {button}
        </a>
        <details className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          <summary className="cursor-pointer select-none transition-colors hover:text-slate-800 dark:hover:text-slate-200">
            {t.checksum}
          </summary>
          <code className="mt-2 block rounded-lg bg-slate-50 p-3 font-mono text-[11px] leading-relaxed break-all text-slate-700 select-all dark:bg-slate-800/60 dark:text-slate-300">
            {file.sha256}
          </code>
        </details>
      </div>
    </article>
  );
}

function ComingSoonCard({ t }: { t: Copy }) {
  return (
    <article className={`${CARD} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-3">
        <span className={LOGO_TILE}>
          <AndroidLogo className="size-7" />
        </span>
        <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
          {t.android.soon}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{t.android.name}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.android.requirements}</p>
      <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-pretty text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {t.android.soonBody}
      </p>
      <div className="mt-auto pt-6">
        <a
          href={WEB_APP}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-700 dark:hover:text-brand-300 ${FOCUS}`}
        >
          <GlobeIcon className="size-4.5" />
          {t.android.openSite}
        </a>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium whitespace-nowrap text-slate-800 tabular-nums dark:text-slate-100">{value}</dd>
    </div>
  );
}

function Steps({
  icon,
  title,
  steps,
  notes,
}: {
  icon: ReactNode;
  title: string;
  steps: ReactNode[];
  notes: string[];
}) {
  return (
    <div className={`${CARD} flex flex-col p-6 sm:p-7`}>
      <h3 className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
        {title}
      </h3>
      <ol className="mt-5 space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 tabular-nums dark:bg-brand-950/60 dark:text-brand-300"
            >
              {i + 1}
            </span>
            <span className="min-w-0 pt-0.5 text-pretty">{step}</span>
          </li>
        ))}
      </ol>
      <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-xs text-pretty text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function FileName({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] wrap-break-word text-slate-800 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </code>
  );
}
