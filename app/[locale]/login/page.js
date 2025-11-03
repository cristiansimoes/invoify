import React from 'react';

const LoginPage = () => {
  return (
    // Estilos simples para centralizar a caixa de login
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5' // Fundo cinza claro
    }}>
      <div style={{ 
          padding: '40px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          width: '90%',
          maxWidth: '400px' // Limitar o tamanho da caixa
      }}>
        <h2>Acesso Exclusivo Fluke Invoice</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
            Para gerar faturas, você precisa estar logado.
        </p>
        
        {/* Simulação de um formulário de login */}
        <form style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input 
                    type="email" 
                    placeholder="seu@email.com" 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }}
                />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
                <input 
                    type="password" 
                    placeholder="sua senha" 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }}
                />
            </div>
            <button 
                type="submit" 
                style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Entrar
            </button>
        </form>

        <p style={{ marginTop: '15px', fontSize: '12px', textAlign: 'center' }}>
            Ainda não tem conta? <a href="#" style={{ color: '#0070f3' }}>Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;