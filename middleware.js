import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";

// i18n config
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "pt-BR"],
  defaultLocale: "en",
});

const publicRoutes = [
  "/",
  "/:locale",
  "/:locale/login",
  "/:locale/sign-up",
];

// ✅ Middleware combinado
export default function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ NUNCA tocar nas rotas API
  if (pathname.startsWith("/api")) {
    return clerkMiddleware()(req); // protege, mas não aplica locale
  }

  return clerkMiddleware({
    publicRoutes
  })(req, evt => intlMiddleware(req));
}

// ✅ Matcher correto (não pega assets)
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
