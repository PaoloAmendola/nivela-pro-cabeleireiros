
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Perfil e Configurações</h1>
        {/* Content for user profile, settings, logout, etc. will go here */}
      </div>
    </ProtectedRoute>
  );
}

