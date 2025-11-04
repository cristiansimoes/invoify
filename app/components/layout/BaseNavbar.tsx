"use client";

import { useMemo } from "react";

// Next
import Link from "next/link";
import { useLocale } from "next-intl";

// ShadCn
import { Card } from "@/components/ui/card";

// Components
import { LanguageSelector, ThemeSwitcher } from "@/app/components";

// Auth (Clerk)
import AuthCorner from "@/app/components/AuthCorner";

const BaseNavbar = () => {
  const devEnv = useMemo(() => process.env.NODE_ENV === "development", []);
  const locale = useLocale();

  return (
    <header className="lg:container z-[99]">
      <nav>
        <Card className="flex flex-wrap justify-between items-center px-6 py-4 gap-5 shadow-sm border-b sticky top-0 bg-white dark:bg-neutral-900 z-50">

          {/* Brand */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: ".3px",
              }}
            >
              FlukeFlow ⚡
            </span>
          </Link>

          {/* DEV Only */}
          

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeSwitcher />
            <AuthCorner />
          </div>
        </Card>
      </nav>
    </header>
  );
};

export default BaseNavbar;
