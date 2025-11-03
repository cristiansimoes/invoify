import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// --------------------------------------------------------
// LÓGICA DE ACESSO
// --------------------------------------------------------
const LOGIN_URL = '/login'; 
const userIsLoggedIn = false; // Mantenha 'false' para forçar o teste de bloqueio

// Crie o middleware de internacionalização original
const intlMiddleware = createMiddleware({
  // Coloque os idiomas que seu projeto suporta aqui
  locales: ['en', 'pt-BR'], 
  // O idioma padrão caso a URL não o especifique
  defaultLocale: 'en' 
});

// O middleware principal para a lógica de bloqueio
export default function middleware(request) {
    
    // Tentativa simples de pegar o idioma da URL
    const currentPath = request.nextUrl.pathname;
    const pathParts = currentPath.split('/');
    const locale = pathParts.length > 1 && (pathParts[1] === 'en' || pathParts[1] === 'pt-BR') ? pathParts[1] : 'en';

    // 1. LÓGICA DE BLOQUEIO
    // Se não estiver logado E não estiver tentando acessar a tela de login
    if (!userIsLoggedIn && !currentPath.includes(LOGIN_URL)) {
        
        // Exceção: Não bloqueie assets internos do Next.js
        if (currentPath.includes('/api/') || currentPath.includes('/_next/') || currentPath.includes('/favicon.ico')) {
            return NextResponse.next();
        }

        // Redireciona para a página de login no idioma correto (ex: /en/login)
        return NextResponse.redirect(new URL(`/${locale}${LOGIN_URL}`, request.url));
    }

    // 2. Continua o fluxo normal: aplica a lógica de internacionalização
    return intlMiddleware(request);
}

// --------------------------------------------------------
// CONFIGURAÇÃO DO MATCHER (Original do Projeto)
// --------------------------------------------------------
export const config = {
    // Roda em todas as rotas, exceto /api, arquivos estáticos, etc.
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};