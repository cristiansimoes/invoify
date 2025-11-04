"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

function AutoGo() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    router.replace(`/${locale}/form`);
  }, [router, locale]);
  return null;
}

export default function AppLanding() {
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-5">

      {/* Redirect if logged in */}
      <SignedIn>
        <AutoGo />
      </SignedIn>

      {/* Landing screen */}
      <SignedOut>
        <h1 className="text-4xl font-bold mb-3">FlukeFlow ⚡</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          The fastest and cleanest way to generate professional invoices.
        </p>

        <SignUpButton redirectUrl={`/${locale}/form`}>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition">
            Create your free account
          </button>
        </SignUpButton>

        <p className="text-sm text-gray-500 mt-2">
          Already have an account?{" "}
          <SignInButton redirectUrl={`/${locale}/form`}>
            <span className="underline cursor-pointer">Sign in</span>
          </SignInButton>
        </p>
      </SignedOut>
    </div>
  );
}
