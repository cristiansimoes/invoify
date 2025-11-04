"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function AuthCorner() {
  const locale = useLocale(); // pega o locale aqui

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <SignedIn>
        <UserButton afterSignOutUrl={`/${locale}/login`} />
      </SignedIn>

      <SignedOut>
        <Link href={`/${locale}/login`}>Sign in</Link>
      </SignedOut>
    </div>
  );
}
