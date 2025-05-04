
'use client'; // This component uses client-side hooks (useState, useEffect)

import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AuthForm = () => {
  const { supabase, session: currentSession } = useAuth(); // Renamed session to currentSession to avoid conflict
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentSession) {
      router.push('/'); // Redirect to home page or dashboard if logged in
    }
  }, [currentSession, router]);

  // Show the Auth UI only on the client-side after mount
  useEffect(() => {
    setShowAuth(true);
  }, []);

  // Handle back button navigation
  const handleBack = () => {
    router.back(); // Go back to the previous page
  };

  if (!showAuth) {
    // Avoid rendering Auth UI during SSR or before hydration
    return <div>Carregando autenticação...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      <h2 className="text-2xl font-semibold text-center mb-6 text-primary dark:text-white">Acessar Nivela Pro</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark" // Or "light" based on your preference or theme context
        providers={['google']} // Example: Add social providers if configured
        localization={{
          variables: {
            sign_in: {
              email_label: 'Seu endereço de e-mail',
              password_label: 'Sua senha',
              email_input_placeholder: 'seuemail@exemplo.com',
              password_input_placeholder: 'Sua senha segura',
              button_label: 'Entrar',
              loading_button_label: 'Entrando...',
              social_provider_text: 'Entrar com {{provider}}',
              link_text: 'Já tem uma conta? Entre',
              // confirmation_text: 'Verifique seu e-mail para o link de confirmação' // Removed unsupported property
            },
            sign_up: {
              email_label: 'Seu endereço de e-mail',
              password_label: 'Crie uma senha',
              email_input_placeholder: 'seuemail@exemplo.com',
              password_input_placeholder: 'Crie uma senha segura',
              button_label: 'Cadastrar',
              loading_button_label: 'Cadastrando...',
              social_provider_text: 'Cadastrar com {{provider}}',
              link_text: 'Não tem uma conta? Cadastre-se',
              // confirmation_text: 'Verifique seu e-mail para o link de confirmação' // Removed unsupported property
            },
            forgotten_password: {
              email_label: 'Seu endereço de e-mail',
              // password_label: 'Sua senha', // Not applicable here
              email_input_placeholder: 'seuemail@exemplo.com',
              button_label: 'Enviar instruções de recuperação',
              loading_button_label: 'Enviando...',
              link_text: 'Esqueceu sua senha?',
              // confirmation_text: 'Verifique seu e-mail para o link de recuperação' // Removed unsupported property
            },
            update_password: {
                password_label: "Nova senha",
                password_input_placeholder: "Sua nova senha segura",
                button_label: "Atualizar senha",
                loading_button_label: "Atualizando...",
                confirmation_text: "Sua senha foi atualizada" // This one seems supported
            }
          },
        }}
      />
    </div>
  );
};

export default AuthForm;

