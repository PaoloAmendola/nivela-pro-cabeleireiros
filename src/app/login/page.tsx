// src/app/login/page.tsx
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-6 text-primary dark:text-white">Acesse sua Conta</h1>
      <AuthForm />
    </div>
  );
}

