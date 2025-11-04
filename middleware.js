// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

const intl = createMiddleware({
  locales: ["en", "pt-BR"],
  defaultLocale: "en",
});

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/:locale",
    "/:locale/login",
    "/:locale/sign-up",
    "/:locale/test-clerk",
    "/(.*)_clerk(.*)",
    "/:locale/(.*)_clerk(.*)",
  ],
  beforeAuth: (req) => intl(req),
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
