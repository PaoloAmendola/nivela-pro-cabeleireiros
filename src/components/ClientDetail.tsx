 'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, User, FileText, Camera } from 'lucide-react';
import AnamnesisForm from './AnamnesisForm';
import PhotoGallery from './PhotoGallery';
import PhotoUploader from './PhotoUploader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Define the structure matching the DB table
interface ClientData {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  created_at: string;
}

const ClientDetail = () => {
  console.log('ClientDetail component mounted'); // Temporary log
  const { supabase, session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  console.log('Client ID from params:', clientId); // Temporary log

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
  const [showPhotoUploaderModal, setShowPhotoUploaderModal] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0); // <-- Add state for refresh key

  const fetchClientData = useCallback(async () => {
    console.log('Fetching client data for ID:', clientId); // Temporary log
    if (!session?.user || !clientId) {
        console.log('Skipping fetch: No session or clientId'); // Temporary log
        setLoading(false); // Ensure loading stops if we skip fetch
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', session.user.id) // Ensure user owns the client record
        .single();

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError); // Temporary log
        if (fetchError.code === 'PGRST116') { // Resource not found
          setError('Cliente não encontrado ou você não tem permissão para acessá-lo.');
        } else {
          throw fetchError;
        }
      }
      console.log('Client data fetched:', data); // Temporary log
      setClient(data);
    } catch (err: unknown) { // Changed any to unknown
      console.error('Error fetching client details:', err); // Log detailed error
      setError(`Erro ao carregar dados do cliente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, session, clientId]);

  useEffect(() => {
    console.log('useEffect triggered for fetchClientData'); // Temporary log
    fetchClientData();
  }, [fetchClientData]);

  const handleAnamnesisSaveSuccess = () => {
    setShowAnamnesisModal(false);
    // Optionally show a success message
  };

  const handlePhotoUploadSuccess = () => {
    setShowPhotoUploaderModal(false);
    // Increment the key to trigger gallery refresh
    setGalleryRefreshKey(prevKey => prevKey + 1); // <-- Increment refresh key
    // Optionally show a success message
    // fetchClientData(); // Calling fetchClientData might be redundant if gallery refreshes itself
  };

  if (loading) {
    console.log('Rendering loading state'); // Temporary log
    return <div>Carregando detalhes do cliente...</div>;
  }

  if (error) {
    console.log('Rendering error state:', error); // Temporary log
    return (
        <div className="text-red-500 p-4">
            {error}
            <Button variant="outline" onClick={() => router.push('/clientes')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
            </Button>
        </div>
    );
  }

  if (!client) {
    console.log('Rendering not found state'); // Temporary log
    return <div className="p-4">Cliente não encontrado.</div>;
  }

  console.log('Rendering client details'); // Temporary log
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Button variant="outline" onClick={() => router.push('/clientes')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <User className="mr-3 h-6 w-6 text-primary" /> {client.name}
              </CardTitle>
              <CardDescription>ID: {client.id}</CardDescription>
            </div>
            {/* TODO: Add Edit Client Button/Functionality */}
            {/* <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" /> {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" /> {client.email}
            </div>
          )}
          <div className="text-xs text-gray-400 pt-2 border-t">
            Criado em: {new Date(client.created_at).toLocaleDateString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Anamnesis: Button triggers state change, Dialog controlled by state */}
        <Button variant="outline" className="w-full" onClick={() => { console.log('[ClientDetail] Anamnesis button clicked'); setShowAnamnesisModal(true); }}>
          <FileText className="mr-2 h-4 w-4" /> Ver/Editar Anamnese
        </Button>
        <Dialog open={showAnamnesisModal} onOpenChange={setShowAnamnesisModal}>
          {/* DialogTrigger removed, Dialog controlled by 'open' prop */}
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
             {/* Log removed from here to avoid build error */}
            <AnamnesisForm clientId={clientId} onSaveSuccess={handleAnamnesisSaveSuccess} />
          </DialogContent>
        </Dialog>

        {/* Photo Uploader Modal Trigger */}
        <Dialog open={showPhotoUploaderModal} onOpenChange={setShowPhotoUploaderModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Adicionar Fotos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]'>
             <DialogHeader>
                <DialogTitle>Adicionar Fotos (Antes/Depois)</DialogTitle>
                <DialogDescription>
                    Faça o upload das fotos do cliente.
                </DialogDescription>
            </DialogHeader>
            <PhotoUploader clientId={clientId} onUploadSuccess={handlePhotoUploadSuccess} />
             <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                    Fechar
                    </Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Photo Gallery - Pass the refresh key */}
      <PhotoGallery clientId={clientId} refreshKey={galleryRefreshKey} /> {/* <-- Pass refresh key */}

    </div>
  );
};

export default ClientDetail;

