import type { Metadata } from "next";
import { DownloadPage } from "@/components/download-page";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.fr.htmlTitle,
  description: copy.fr.description,
};

export default function Page() {
  return <DownloadPage locale="fr" />;
}
