import ProtectedRoute from "@/components/ProtectedRoute";
import ClientDetail from "@/components/ClientDetail"; // Import the ClientDetail component

// Define props type (optional, can be removed if params are not used)
// interface ClientDetailPageProps {
//   params: { id: string };
// }

// Removed unused 'params' from function signature to fix linting error
export default function ClientDetailPage(/* { params }: ClientDetailPageProps */) {
  return (
    <ProtectedRoute>
      <div className="p-4">
        {/* ClientDetail still uses useParams internally */}
        <ClientDetail />
      </div>
    </ProtectedRoute>
  );
}

