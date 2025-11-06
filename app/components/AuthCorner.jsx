"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useLocale } from "next-intl";

async function openStripePortal() {
  try {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Unable to open billing portal");
  } catch (e) {
    alert("Connection error");
  }
}

export default function AuthCorner() {
  const locale = useLocale();
  const { user } = useUser();
  const isPaid = user?.publicMetadata?.isPaid === true;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

      {/* ✅ Dashboard Btn (logged in only) */}
      <SignedIn>
        <Link
          href={`/${locale}/dashboard`}
          className="text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
        >
          Dashboard
        </Link>
      </SignedIn>

      {isPaid && (
        <button
          onClick={openStripePortal}
          style={{ padding: "6px 10px", border: "1px solid #ddd" }}
        >
          Manage Subscription
        </button>
      )}

      <SignedIn>
        <UserButton afterSignOutUrl={`/${locale}/login`} />
      </SignedIn>

      <SignedOut>
        <Link href={`/${locale}/login`}>Sign in</Link>
      </SignedOut>
    </div>
  );
}
