import type { Metadata } from "next";
import { DownloadPage } from "@/components/download-page";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.en.htmlTitle,
  description: copy.en.description,
};

export default function Page() {
  return <DownloadPage locale="en" />;
}
