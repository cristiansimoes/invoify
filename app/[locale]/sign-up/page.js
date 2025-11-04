"use client";

import { SignUp } from "@clerk/nextjs";
import { useLocale } from "next-intl";

export default function SignUpPage() {
  const locale = useLocale();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Create your account 🚀</h1>
        <p className="text-gray-500">Start generating professional invoices</p>
      </div>

      <div className="rounded-xl border shadow-sm p-6 bg-white dark:bg-neutral-900">
        <SignUp
          routing="path"
          path={`/${locale}/sign-up`}
          signInUrl={`/${locale}/login`}
          redirectUrl={`/${locale}/form`}
        />
      </div>
    </div>
  );
}
