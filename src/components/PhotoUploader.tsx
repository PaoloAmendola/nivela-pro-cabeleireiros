
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames
import Image from 'next/image'; // Import next/image

interface PhotoUploaderProps {
  clientId: string;
  onUploadSuccess?: () => void; // Optional callback
}

type LabelOption = 'antes' | 'depois' | 'durante' | 'outro' | '';

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ clientId, onUploadSuccess }) => {
  const { supabase, session } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [label, setLabel] = useState<LabelOption>('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user) {
      setError('Selecione um arquivo e certifique-se de estar logado.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${session.user.id}/${clientId}/${fileName}`;

      // Use the correct bucket name 'upload-photos'
      const { error: uploadError } = await supabase.storage
        .from('upload-photos') // Corrected bucket name
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Insert metadata into the 'client_photos' table
      const { error: dbError } = await supabase
        .from('client_photos')
        .insert({
          client_id: clientId,
          user_id: session.user.id,
          photo_url: filePath, // Store the path used in the bucket
          label: label || null,
          description: description || null,
          photo_type: 'Geral', // Added default value for photo_type
        });

      // If DB insert fails, remove the uploaded file from storage
      if (dbError) {
        await supabase.storage.from('upload-photos').remove([filePath]); // Corrected bucket name for removal
        throw dbError;
      }

      alert('Foto enviada com sucesso!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setLabel('');
      setDescription('');
      if (onUploadSuccess) onUploadSuccess();

    } catch (err: unknown) {
      console.error('Error uploading photo:', err);
      // Improved error message handling
      let errorMessage = 'Erro desconhecido';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        // Try to extract message from Supabase error object or similar
        errorMessage = String((err as { message: string }).message);
      } else if (err) {
        // Fallback to stringifying the error if it's not null/undefined
        try {
          errorMessage = JSON.stringify(err);
        } catch /* istanbul ignore next */ { // Removed unused variable 'stringifyError'
          // console.error('Non-serializable error:', stringifyError); // Optional: log the stringify error itself
          errorMessage = 'Ocorreu um erro não serializável.';
        }
      }
      setError(`Erro ao enviar foto: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm break-words">{error}</span> {/* Added break-words */} 
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="photo-upload">Selecionar Foto</Label>
        <Input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>

      {previewUrl && (
        <div className="mt-4 border rounded-md p-2 flex justify-center relative aspect-video max-h-48"> {/* Use relative and aspect ratio */}
          <Image
            src={previewUrl}
            alt="Pré-visualização"
            layout="fill" // Use fill layout
            objectFit="contain" // Use contain to fit image within bounds
            className="rounded"
            unoptimized // Keep if source is data URL
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Etiqueta (Opcional)</Label>
        {/* Correctly type the onValueChange handler */}
        <Select name="label" value={label} onValueChange={(value: LabelOption) => setLabel(value)} disabled={uploading}>
          <SelectTrigger><SelectValue placeholder="Selecione (Antes, Depois...)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="antes">Antes</SelectItem>
            <SelectItem value="depois">Depois</SelectItem>
            <SelectItem value="durante">Durante</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione uma breve descrição ou observação..."
          disabled={uploading}
          rows={3}
        />
      </div>

      <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
        {uploading ? 'Enviando...' : <><UploadCloud className="mr-2 h-4 w-4" /> Enviar Foto</>}
      </Button>
    </div>
  );
};

export default PhotoUploader;


// Force re-commit

