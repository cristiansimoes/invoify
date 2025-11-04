// app/[locale]/layout.tsx
import React from "react";

// Components
import { BaseFooter, BaseNavbar } from "@/app/components";
// Shadcn
import { Toaster } from "@/components/ui/toaster";
// Contexts
import Providers from "@/contexts/Providers";
// Fonts
import {
  alexBrush,
  dancingScript,
  greatVibes,
  outfit,
  parisienne,
} from "@/lib/fonts";
// SEO
import { JSONLD, ROOTKEYWORDS } from "@/lib/seo";
// Variables
import { BASE_URL, GOOGLE_SC_VERIFICATION, LOCALES } from "@/lib/variables";
// Favicon
import Favicon from "@/public/assets/favicon/favicon.ico";
// Vercel Analytics
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
// Next Intl
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "FlukeFlow | Free Invoice Generator",
  description:
    "Create invoices effortlessly with FlukeFlow, the free invoice generator. Try it now!",
  icons: [{ rel: "icon", url: Favicon.src }],
  keywords: ROOTKEYWORDS,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
  authors: {
    // changed to your instagram as requested
    name: "Cristian Menezes",
    url: "https://www.instagram.com/_chrismenezes11/",
  },
  verification: {
    google: GOOGLE_SC_VERIFICATION,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  const locales = LOCALES.map((locale) => ({ locale: locale.code }));
  return locales;
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  let messages;
  try {
    messages = (await import(`@/i18n/locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          type="application/ld+json"
          id="json-ld"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
        />
        {/* BuyMeACoffee widget: data-id set to your handle */}
        <script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="chrismenezes"
          data-description="Support me on Buy Me A Coffee!"
          data-message="Thank you for using FlukeFlow"
          data-color="#5F7FFF"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
        ></script>
      </head>
      <body
        className={`${outfit.className} ${dancingScript.variable} ${parisienne.variable} ${greatVibes.variable} ${alexBrush.variable} antialiased bg-slate-100 dark:bg-slate-800`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <BaseNavbar />

            <div className="flex flex-col">{children}</div>

            <BaseFooter />

            {/* Toast component */}
            <Toaster />

            {/* Vercel analytics */}
            <Analytics />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
