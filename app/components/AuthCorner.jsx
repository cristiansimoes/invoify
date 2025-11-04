"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useLocale } from "next-intl";

export default function AuthCorner() {
  const locale = useLocale();

  return (
    <div className="flex items-center gap-3">
      {/* Logged out */}
      <SignedOut>
        <SignInButton redirectUrl={`/${locale}/form`}>
          <button className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>

      {/* Logged in */}
      <SignedIn>
        <UserButton
          afterSignOutUrl={`/${locale}`}
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
