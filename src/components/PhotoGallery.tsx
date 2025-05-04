
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Download, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Interface for data fetched from DB
interface ClientPhotoDB {
  id: string;
  client_id: string;
  user_id: string;
  photo_url: string; // This stores the path within the bucket
  label?: 'antes' | 'depois' | 'durante' | 'outro' | null;
  description?: string | null;
  created_at: string;
}

// Interface for state, including public URL and storage path
interface ClientPhotoState extends ClientPhotoDB {
  publicUrl: string;
  storagePath: string;
  fetchError?: string; // Optional field to indicate fetch error for a specific photo
}

interface PhotoGalleryProps {
  clientId: string;
  refreshKey?: number; // <-- Add refreshKey prop
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ clientId, refreshKey }) => { // <-- Destructure refreshKey
  const { supabase, session } = useAuth();
  // Use the extended state interface
  const [photos, setPhotos] = useState<ClientPhotoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // General error for the component
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    console.log("fetchPhotos called"); // Log when fetchPhotos starts
    if (!session?.user || !clientId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch photo metadata from the database
      const { data, error: fetchError } = await supabase
        .from('client_photos') // DB table name
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError; // Throw if DB fetch fails

      console.log("DB data fetched:", data); // Log fetched DB data

      // Get public URLs for photos from the correct bucket
      const photosWithUrls: ClientPhotoState[] = await Promise.all(
        (data || []).map(async (photo: ClientPhotoDB) => {
          const storagePath = photo.photo_url; // photo_url from DB is the path
          let publicUrl = '/placeholder.png'; // Default placeholder
          let photoFetchError: string | undefined = undefined;

          if (storagePath) { // Only try to get URL if path exists
            try {
              const { data: urlData, error: urlError } = supabase.storage
                .from('upload-photos') // Corrected bucket name
                .getPublicUrl(storagePath);

              if (urlError) {
                console.error(`Error getting public URL for ${storagePath}:`, urlError);
                photoFetchError = urlError.message; // Store specific error
              } else if (urlData?.publicUrl) {
                publicUrl = urlData.publicUrl;
              }
            } catch (urlErr: unknown) {
              console.error(`Exception getting public URL for ${storagePath}:`, urlErr);
              photoFetchError = urlErr instanceof Error ? urlErr.message : 'Unknown URL fetch error';
            }
          } else {
            photoFetchError = 'Storage path (photo_url) is missing in the database record.';
            console.warn(`Missing photo_url for DB record ID: ${photo.id}`);
          }

          return {
            ...photo,
            publicUrl: publicUrl,
            storagePath: storagePath || '', // Ensure storagePath is always a string
            fetchError: photoFetchError // Add the specific fetch error if any
          };
        })
      );

      console.log("Photos with URLs processed:", photosWithUrls); // Log processed photos
      setPhotos(photosWithUrls);

    } catch (err: unknown) {
      console.error('Error fetching photos metadata:', err);
      // Set general error only if the initial DB fetch fails
      setError(`Erro ao carregar dados das fotos: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, session, clientId]); // Keep original dependencies, refreshKey will trigger useEffect

  useEffect(() => {
    console.log("useEffect triggered, refreshKey:", refreshKey); // Log useEffect trigger
    fetchPhotos();
  }, [fetchPhotos, refreshKey]); // <-- Add refreshKey to dependency array

  // handleDelete accepts storagePath directly
  const handleDelete = async (photoId: string, storagePath: string) => {
    if (!session?.user || !window.confirm('Tem certeza que deseja excluir esta foto?')) return;

    try {
      // 1. Delete from Storage using the correct path and bucket
      if (storagePath) {
        console.log("Attempting to delete from storage:", storagePath);
        const { error: storageError } = await supabase.storage
          .from('upload-photos') // Corrected bucket name
          .remove([storagePath]);
        if (storageError && storageError.message !== 'The resource was not found') {
          // Log warning but don't necessarily stop DB deletion
          console.warn('Error deleting from storage (will still attempt DB delete):', storageError);
        }
      } else {
          console.warn("Storage path not provided for deletion, skipping storage delete.");
      }

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from('client_photos') // DB table name
        .delete()
        .eq('id', photoId)
        .eq('user_id', session.user.id);

      if (dbError) throw dbError;

      // Update state
      setPhotos(photos.filter(p => p.id !== photoId));
      alert('Foto excluída com sucesso.');

    } catch (err: unknown) {
      console.error('Error deleting photo:', err);
      alert(`Erro ao excluir foto: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleDownload = (url: string) => {
    // Prevent download if it's the placeholder
    if (url === '/placeholder.png') {
        alert('Não é possível baixar a imagem de placeholder.');
        return;
    }
    const link = document.createElement('a');
    link.href = url;
    let filename = 'foto_cliente.jpg';
    try {
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart.includes('.')) {
            filename = lastPart.split('?')[0]; // Remove query params if any
        }
    } catch {
        // Ignore errors, use default
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div>Carregando galeria de fotos...</div>;
  }

  // Show general error only if the initial DB fetch fails
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeria de Fotos (Antes/Depois)</CardTitle>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Nenhuma foto adicionada para este cliente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-100"> {/* Added bg-gray-100 for placeholder visibility */}
                {/* Conditionally render placeholder or image */}
                {photo.fetchError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mb-1" />
                    <p className="text-xs text-yellow-700">Erro ao carregar</p>
                    {/* Optionally show tooltip with error on hover */}
                    <p className="text-xs text-yellow-500 truncate" title={photo.fetchError}>({photo.fetchError})</p>
                  </div>
                ) : (
                  <Dialog open={selectedPhotoUrl === photo.publicUrl} onOpenChange={(isOpen) => !isOpen && setSelectedPhotoUrl(null)}>
                    <DialogTrigger asChild>
                      <button onClick={() => setSelectedPhotoUrl(photo.publicUrl)} className="absolute inset-0">
                        <Image
                          src={photo.publicUrl}
                          alt={photo.description || `Foto ${photo.label || 'do cliente'}`}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 group-hover:scale-105"
                          unoptimized // Add if images are external
                          onError={(e) => {
                              // Handle potential image loading errors even if URL was fetched
                              console.error("Image load error:", e.currentTarget.src);
                              // Optionally set a state to show placeholder here too
                              e.currentTarget.src = '/placeholder.png'; // Fallback
                              e.currentTarget.srcset = '';
                          }}
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0">
                      <Image
                        src={photo.publicUrl}
                        alt={photo.description || `Foto ${photo.label || 'do cliente'}`}
                        width={800}
                        height={600}
                        objectFit="contain"
                        className="w-full h-auto max-h-[80vh]"
                        unoptimized
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {/* Overlay with actions on hover - disable if fetchError exists */}
                {!photo.fetchError && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20"
                      onClick={() => handleDownload(photo.publicUrl)}
                      title="Baixar Foto"
                      disabled={photo.publicUrl === '/placeholder.png'} // Disable download for placeholder
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:bg-red-500/20 hover:text-red-500"
                      onClick={() => handleDelete(photo.id, photo.storagePath)}
                      title="Excluir Foto"
                      disabled={!photo.storagePath} // Disable if path is missing
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {photo.label && (
                  <span className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                    {photo.label.charAt(0).toUpperCase() + photo.label.slice(1)} {/* Capitalize label */}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoGallery;

