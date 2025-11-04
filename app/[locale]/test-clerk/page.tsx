"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function TestClerkPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale || "en";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:"20px" }}>
      <h1>🔐 Teste do Clerk ({locale})</h1>

      <SignedIn>
        <p>Você está logado ✅</p>
        <UserButton afterSignOutUrl={`/${locale}`} />
      </SignedIn>

      <SignedOut>
        <p>Você não está logado ❌</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
