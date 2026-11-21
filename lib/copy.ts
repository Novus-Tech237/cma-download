/**
 * Every visible string, in French (the default, served at /) and English
 * (/en). `en` is typed from `fr`, so a key missing from either fails `tsc`.
 *
 * `{name}` marks a slot the page fills with an element (a link, a file name);
 * see `rich()` in components/download-page.tsx.
 */

export type Locale = "fr" | "en";

/**
 * French typography: a non-breaking space inside « » and before : ; ? !,
 * so a guillemet or a colon never starts or ends a line on its own.
 */
function typeset<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/« /g, "« ").replace(/ ([»:;?!])/g, " $1") as T;
  }
  if (Array.isArray(value)) return value.map(typeset) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeset(v)])) as T;
  }
  return value;
}

const fr = typeset({
  htmlTitle: "Télécharger CMA HMS · Centre Médical AFUNA",
  description:
    "Installez CMA HMS, le système de gestion hospitalière du Centre Médical AFUNA, sur Windows et Android.",
  logoAlt: "Centre Médical AFUNA",
  language: "Langue",
  home: "Accueil",

  eyebrow: "Version {version}",
  title: "Téléchargez {app}",
  lead: "Le système de gestion hospitalière du Centre Médical AFUNA, dans sa propre application pour Windows et Android.",
  sameEverywhere:
    "L'application ouvre {site} : même matricule, mêmes données, et chaque mise à jour du site y arrive aussitôt.",
  otherDevice:
    "Il n'y a pas d'application CMA HMS pour cet appareil. Ouvrez {site} dans le navigateur : la page de connexion propose de l'ajouter à l'écran d'accueil.",

  downloads: "Téléchargements",
  forThisDevice: "Pour cet appareil",
  facts: { version: "Version", size: "Taille", date: "Date" },
  megabytes: "Mo",
  checksum: "Empreinte SHA-256",

  windows: {
    name: "Windows",
    requirements: "Windows 10 et 11, 64 bits",
    button: "Télécharger pour Windows",
  },
  android: {
    name: "Android",
    requirements: "Android 7 et versions ultérieures",
    button: "Télécharger l'APK",
    soon: "Bientôt disponible",
    soonBody:
      "L'application Android est en préparation. En attendant, CMA HMS s'installe sur le téléphone depuis le navigateur : voir ci-dessous.",
    openSite: "Ouvrir CMA HMS",
  },

  install: {
    title: "Installation",
    windowsTitle: "Sur un PC Windows",
    windowsSteps: {
      open: "Ouvrez le fichier téléchargé, {file}.",
      smartScreen:
        "Si Windows affiche « Windows a protégé votre ordinateur », cliquez sur « Informations complémentaires », puis sur « Exécuter quand même ». L'installateur n'est pas encore signé : cet avertissement est attendu.",
      perUser:
        "L'installation se fait pour votre session Windows, sans droits d'administrateur. CMA HMS s'ajoute au menu Démarrer.",
      signIn: "Ouvrez CMA HMS et connectez-vous avec votre matricule.",
    },
    windowsNotes: [
      "Mise à jour : lancez le nouvel installateur par-dessus l'ancien. Vous restez connecté.",
      "Sur un PC partagé, chaque utilisateur Windows installe l'application pour sa session, et se déconnecte avant de partir.",
      "Windows 10 : si le composant WebView2 manque, l'installateur le télécharge. Il faut alors une connexion Internet.",
    ],
    androidTitle: "Sur un téléphone Android",
    androidSteps: [
      "Ouvrez l'APK téléchargée, depuis la notification ou le dossier Téléchargements.",
      "Android demande d'autoriser l'installation d'applications inconnues pour le navigateur : autorisez-la.",
      "Si Play Protect signale un développeur inconnu, choisissez « Installer quand même ».",
      "Ouvrez CMA HMS et connectez-vous avec votre matricule.",
    ],
    androidNotes: ["Mise à jour : installez la nouvelle APK de la même façon, par-dessus l'ancienne."],
    phoneTitle: "Sur un téléphone",
    phoneSteps: [
      "Ouvrez {site} dans Chrome (Android) ou Safari (iPhone).",
      "Sur la page de connexion, touchez « Installer » dans la bannière qui apparaît. Sur iPhone : Partager, puis « Sur l'écran d'accueil ».",
      "CMA HMS s'ouvre ensuite en plein écran depuis l'écran d'accueil.",
    ],
    phoneNotes: ["Pas de bannière sur Android ? Menu ⋮ de Chrome, puis « Ajouter à l'écran d'accueil »."],
  },

  browser: {
    title: "Sans installation",
    body: "CMA HMS fonctionne aussi dans tout navigateur récent, sur ordinateur comme sur téléphone.",
    button: "Ouvrir CMA HMS",
  },
  unavailable: {
    title: "Téléchargements momentanément indisponibles",
    body: "Les applications ne peuvent pas être téléchargées pour le moment. Réessayez un peu plus tard ; en attendant, CMA HMS fonctionne dans le navigateur.",
  },
  footer: "Centre Médical AFUNA",
});

export type Copy = typeof fr;

const en: Copy = {
  htmlTitle: "Download CMA HMS · Centre Médical AFUNA",
  description:
    "Install CMA HMS, the Centre Médical AFUNA hospital management system, on Windows and Android.",
  logoAlt: "Centre Médical AFUNA",
  language: "Language",
  home: "Home",

  eyebrow: "Version {version}",
  title: "Download {app}",
  lead: "The Centre Médical AFUNA hospital management system, in its own app for Windows and Android.",
  sameEverywhere:
    "The app opens {site}: the same matricule, the same data, and every update to the site reaches it straight away.",
  otherDevice:
    "There is no CMA HMS app for this device. Open {site} in the browser: the sign-in page offers to add it to the home screen.",

  downloads: "Downloads",
  forThisDevice: "For this device",
  facts: { version: "Version", size: "Size", date: "Date" },
  megabytes: "MB",
  checksum: "SHA-256 checksum",

  windows: {
    name: "Windows",
    requirements: "Windows 10 and 11, 64-bit",
    button: "Download for Windows",
  },
  android: {
    name: "Android",
    requirements: "Android 7 and later",
    button: "Download the APK",
    soon: "Coming soon",
    soonBody:
      "The Android app is on its way. Until then, CMA HMS installs on a phone from the browser: see below.",
    openSite: "Open CMA HMS",
  },

  install: {
    title: "How to install",
    windowsTitle: "On a Windows PC",
    windowsSteps: {
      open: "Open the downloaded file, {file}.",
      smartScreen:
        "If Windows shows “Windows protected your PC”, click “More info”, then “Run anyway”. The installer is not signed yet, so this warning is expected.",
      perUser:
        "It installs for your Windows account, without administrator rights, and adds CMA HMS to the Start menu.",
      signIn: "Open CMA HMS and sign in with your matricule.",
    },
    windowsNotes: [
      "Updating: run the newer installer over the old one. You stay signed in.",
      "On a shared PC, each Windows user installs the app for their own account, and signs out before leaving.",
      "Windows 10: if the WebView2 component is missing, the installer downloads it, which needs an internet connection.",
    ],
    androidTitle: "On an Android phone",
    androidSteps: [
      "Open the downloaded APK, from the notification or the Downloads folder.",
      "Android asks you to allow installing unknown apps from the browser: allow it.",
      "If Play Protect warns about an unknown developer, choose “Install anyway”.",
      "Open CMA HMS and sign in with your matricule.",
    ],
    androidNotes: ["Updating: install the newer APK the same way, over the old one."],
    phoneTitle: "On a phone",
    phoneSteps: [
      "Open {site} in Chrome (Android) or Safari (iPhone).",
      "On the sign-in page, tap “Install” in the banner that appears. On iPhone: Share, then “Add to Home Screen”.",
      "CMA HMS then opens full screen from the home screen.",
    ],
    phoneNotes: ["No banner on Android? Chrome's ⋮ menu, then “Add to Home screen”."],
  },

  browser: {
    title: "No installation",
    body: "CMA HMS also works in any recent browser, on a computer or a phone.",
    button: "Open CMA HMS",
  },
  unavailable: {
    title: "Downloads unavailable for now",
    body: "The apps cannot be downloaded at the moment. Try again a little later; meanwhile, CMA HMS works in the browser.",
  },
  footer: "Centre Médical AFUNA",
};

export const copy: Record<Locale, Copy> = { fr, en };

/** The page's address in each language. */
export const localePath: Record<Locale, string> = { fr: "/", en: "/en" };

/** Number and date formats per language; dates in the clinic's time zone. */
export const intlLocale: Record<Locale, string> = { fr: "fr-FR", en: "en-GB" };
export const TIME_ZONE = "Africa/Douala";
