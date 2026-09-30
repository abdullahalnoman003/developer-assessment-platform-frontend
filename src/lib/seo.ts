import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "./constants";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  url: SITE_URL,
};

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description = APP_TAGLINE,
  path = "/",
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${APP_NAME}`,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
