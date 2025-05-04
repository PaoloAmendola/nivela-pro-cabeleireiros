
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientList from "@/components/ClientList"; // Import the ClientList component

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        {/* The ClientList component now handles the title and add button */}
        <ClientList />
      </div>
    </ProtectedRoute>
  );
}

