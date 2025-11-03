import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from 'next/server';

// A URL onde o usuário será enviado para fazer o login/cadastro.
const LOGIN_URL = '/login'; 
// ⚠️ Para teste: Mantenha 'false' para forçar o redirecionamento.
const userIsLoggedIn = false; 

// O Middleware principal é uma função que envolve o Middleware de internacionalização
export default function middleware(request) {

  const currentPath = request.nextUrl.pathname;
  const locale = currentPath.split('/')[1]; // Pega o idioma (ex: 'en' ou 'pt-BR')

  // 1. LÓGICA DE BLOQUEIO (Redirecionamento)
  // Se não estiver logado E não estiver tentando acessar a tela de login
  if (!userIsLoggedIn && !currentPath.includes(LOGIN_URL)) {

      // NÃO bloqueie se já estivermos nas rotas internas de Next.js/Vercel
      if (currentPath.includes('/api/') || currentPath.includes('/_next/') || currentPath.includes('/favicon.ico')) {
          return NextResponse.next();
      }

      // Redireciona para a página de login no idioma correto (ex: /en/login)
      return NextResponse.redirect(new URL(`/${locale}${LOGIN_URL}`, request.url));
  }

  // Se o usuário estiver logado OU se ele estiver tentando acessar o login,
  // a lógica de i18n (internacionalização) será aplicada
  return createMiddleware(routing)(request);
}

// Configura o middleware para rodar em todas as rotas (exceto o que ignoramos no config)
export const config = {
  // O 'matcher' original do projeto: ignora APIs, arquivos estáticos, etc.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};