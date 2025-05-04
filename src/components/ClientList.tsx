
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, User, AlertCircle } from 'lucide-react'; // Added AlertCircle

// Define the structure matching the DB table
interface ClientData {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  created_at: string;
}

const ClientList = () => {
  const { supabase, session } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({}); // Changed any to unknown

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo({ sessionStatus: session ? 'Session exists' : 'No session', userId: session?.user?.id ?? 'N/A' }); // Initial debug info

    if (!session?.user) {
        setLoading(false);
        const noSessionError = 'Sessão não encontrada. Faça login novamente.';
        setError(noSessionError);
        setDebugInfo(prev => ({ ...prev, fetchError: noSessionError })); // Update debug info
        return;
    }

    try {
      setDebugInfo(prev => ({ ...prev, fetchingForUserId: session.user.id })); // Update debug info
      const query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name', { ascending: true });

      //if (searchTerm) {
      //  setDebugInfo(prev => ({ ...prev, applyingSearch: searchTerm })); // Update debug info
      //  query = query.ilike("name", `%${searchTerm}%`);
      //}

      console.log("Executing Supabase query:", query); // Added log
      setDebugInfo(prev => ({ ...prev, executingQuery: true })); // Update debug info
      const { data, error: fetchError } = await query;

      if (fetchError) {
        setDebugInfo(prev => ({ ...prev, supabaseError: fetchError })); // Update debug info
        throw fetchError;
      }
      setDebugInfo(prev => ({ ...prev, querySuccess: true, fetchedCount: data?.length ?? 0 })); // Update debug info
      setClients(data || []);
    } catch (err: unknown) {
      const errorMessage = `Erro ao carregar clientes: ${err instanceof Error ? err.message : 'Erro desconhecido'}`;
      setError(errorMessage);
      setDebugInfo(prev => ({ ...prev, catchError: err, finalErrorMsg: errorMessage })); // Update debug info
    } finally {
      setLoading(false);
      setDebugInfo(prev => ({ ...prev, loadingFinished: true })); // Update debug info
    }
  }, [supabase, session, searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Visual Debug Output Component
  const DebugDisplay = () => (
    <div className="mt-4 p-4 border border-dashed border-yellow-500 bg-yellow-50 text-xs">
      <h4 className="font-bold mb-2">Debug Info:</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      {loading && <p className="text-blue-600">Current Status: Loading...</p>}
      {error && <p className="text-red-600">Current Status: Error - {error}</p>}
      {!loading && !error && <p className="text-green-600">Current Status: Loaded ({clients.length} clients)</p>}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Always render DebugDisplay for diagnosis */}
      <DebugDisplay />

      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-2xl font-semibold">Meus Clientes</h2>
        <Link href="/clientes/novo" passHref>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Adicionar Cliente
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar cliente por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conditional Rendering based on state AFTER debug info */}
      {loading && (
        <div className="text-center p-4">Carregando lista de clientes...</div>
      )}

      {!loading && error && (
        <div className="text-red-500 p-4 bg-red-50 border border-red-200 rounded flex items-center">
          <AlertCircle className="mr-2 h-5 w-5"/> {error}
        </div>
      )}

      {!loading && !error && clients.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          {searchTerm ? 'Nenhum cliente encontrado com esse nome.' : 'Você ainda não adicionou nenhum cliente.'}
        </p>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="space-y-4">
          {clients.map(client => (
            <Link href={`/clientes/${client.id}`} key={client.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary"/> {client.name}
                  </CardTitle>
                </CardHeader>
                {(client.phone || client.email) && (
                    <CardContent className="text-sm text-muted-foreground">
                        {client.phone && <div>Telefone: {client.phone}</div>}
                        {client.email && <div>Email: {client.email}</div>}
                    </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientList;

