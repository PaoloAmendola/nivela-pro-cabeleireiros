
import ProtectedRoute from "@/components/ProtectedRoute";
import AddClientForm from "@/components/AddClientForm";

export default function AddClientPage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <AddClientForm />
      </div>
    </ProtectedRoute>
  );
}

