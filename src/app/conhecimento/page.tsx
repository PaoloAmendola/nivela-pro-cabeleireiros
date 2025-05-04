
import ProtectedRoute from "@/components/ProtectedRoute";
import KnowledgeCenter from "@/components/KnowledgeCenter"; // Import the component

export default function ConhecimentoPage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        {/* The KnowledgeCenter component handles title, search, tabs, etc. */}
        <KnowledgeCenter />
      </div>
    </ProtectedRoute>
  );
}

