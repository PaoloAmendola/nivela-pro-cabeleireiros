
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Bem-vindo ao Nivela Pro</h1>
        <p className="mt-2">Seu assistente digital para aplicação e conhecimento do Nivela.</p>
        {/* Dashboard content will go here */}
      </div>
    </ProtectedRoute>
  );
}

