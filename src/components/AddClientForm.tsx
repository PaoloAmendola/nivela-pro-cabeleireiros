
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

const AddClientForm = () => {
  const { supabase, session } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      setError('Você precisa estar logado para adicionar clientes.');
      return;
    }
    if (!name) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          user_id: session.user.id,
          name,
          phone: phone || null,
          email: email || null,
        })
        .select()
        .single(); // Get the inserted record

      if (insertError) throw insertError;

      alert('Cliente adicionado com sucesso!');
      // Redirect to the newly created client's detail page
      if (data?.id) {
        router.push(`/clientes/${data.id}`);
      } else {
        router.push('/clientes'); // Fallback to client list
      }

    } catch (err: unknown) { // Changed any to unknown
      console.error('Error adding client:', err);
      setError(`Erro ao adicionar cliente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && (
        <div className="flex items-center p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(XX) XXXXX-XXXX"
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adicionando...' : 'Adicionar Cliente'}
      </Button>
    </form>
  );
};

export default AddClientForm;

