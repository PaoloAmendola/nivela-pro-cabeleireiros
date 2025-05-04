
import ProtectedRoute from "@/components/ProtectedRoute";
import InteractiveGuide from "@/components/InteractiveGuide";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Video } from "lucide-react";

// Force dynamic rendering for this page to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function GuiaPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-primary dark:text-white">Guia de Aplicação Nivela</h1>

        {/* Options to view PDF or Video */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link href="/passo-a-passo-nivela.pdf" target="_blank">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" /> Ver PDF Completo
            </Button>
          </Link>
          <a href="https://youtu.be/lDKNZIztUMw" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Video className="mr-2 h-4 w-4 text-red-600" /> Assistir Vídeo no YouTube
            </Button>
          </a>
        </div>

        {/* Interactive Guide Component */}
        <InteractiveGuide />

        {/* TODO: Add Checklist component link/modal here */}
        {/* TODO: Add Timer component link/modal here */}
      </div>
    </ProtectedRoute>
  );
}

