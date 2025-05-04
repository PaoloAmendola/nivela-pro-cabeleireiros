
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Define the structure matching the DB table (can be imported later)
interface AnamnesisData {
  id?: string;
  client_id: string;
  user_id: string;
  natural_color?: string | null;
  has_coloration?: boolean | null;
  coloration_details?: string | null;
  has_highlights?: boolean | null;
  highlights_details?: string | null;
  texture?: string | null;
  density?: string | null;
  elasticity?: string | null;
  porosity?: string | null;
  scalp_condition?: string | null;
  previous_straightening?: string | null;
  last_straightening_date?: string | null; // Use string for date input
  other_chemicals?: string | null;
  hair_routine?: string | null;
  main_complaint?: string | null;
  desired_result?: string | null;
  allergies?: string | null;
  medication?: string | null;
  is_pregnant_or_lactating?: boolean | null;
  strand_test_result?: string | null;
  professional_observations?: string | null;
  recommended_procedure?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AnamnesisFormProps {
  clientId: string;
  onSaveSuccess?: () => void; // Optional callback after saving
}

const AnamnesisForm: React.FC<AnamnesisFormProps> = ({ clientId, onSaveSuccess }) => {
  const { supabase, session } = useAuth();
  const [formData, setFormData] = useState<Partial<AnamnesisData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing anamnesis data
  const fetchAnamnesis = useCallback(async () => {
    if (!session?.user || !clientId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('client_anamnesis')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle(); // Use maybeSingle as it might not exist yet

      if (fetchError) throw fetchError;
      if (data) {
        // Format date for input field if it exists
        if (data.last_straightening_date) {
          data.last_straightening_date = new Date(data.last_straightening_date).toISOString().split('T')[0];
        }
        setFormData(data);
      }
    } catch (err: unknown) { // Changed any to unknown
      console.error('Error fetching anamnesis:', err);
      setError(`Erro ao carregar dados da anamnese: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, session, clientId]);

  useEffect(() => {
    fetchAnamnesis();
  }, [fetchAnamnesis]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
        setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      setError('Você precisa estar logado.');
      return;
    }

    setSaving(true);
    setError(null);

    const dataToSave: Omit<AnamnesisData, 'id' | 'created_at' | 'updated_at'> & { id?: string } = {
      ...formData,
      client_id: clientId,
      user_id: session.user.id,
      // Ensure boolean values are handled correctly (null if unchecked and field allows null)
      has_coloration: formData.has_coloration ?? null,
      has_highlights: formData.has_highlights ?? null,
      is_pregnant_or_lactating: formData.is_pregnant_or_lactating ?? null,
      // Convert date string back to null if empty
      last_straightening_date: formData.last_straightening_date || null,
    };

    try {
      const { error: saveError } = await supabase
        .from('client_anamnesis')
        .upsert(dataToSave, { onConflict: 'client_id' }); // Upsert based on client_id

      if (saveError) throw saveError;

      alert('Anamnese salva com sucesso!');
      if (onSaveSuccess) onSaveSuccess();
      // Optionally refetch data or update state locally
      fetchAnamnesis(); 

    } catch (err: unknown) { // Changed any to unknown
      console.error('Error saving anamnesis:', err);
      setError(`Erro ao salvar anamnese: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando formulário de anamnese...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ficha de Anamnese</CardTitle>
        <CardDescription>Preencha os detalhes da análise capilar do cliente.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Hair Characteristics Section */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-primary dark:text-white">Características do Cabelo</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="natural_color">Cor Natural</Label>
                <Input id="natural_color" name="natural_color" value={formData.natural_color || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="texture">Textura</Label>
                <Select name="texture" value={formData.texture || ''} onValueChange={(value) => handleSelectChange('texture', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fino">Fino</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Grosso">Grosso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="density">Densidade</Label>
                 <Select name="density" value={formData.density || ''} onValueChange={(value) => handleSelectChange('density', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="elasticity">Elasticidade</Label>
                 <Select name="elasticity" value={formData.elasticity || ''} onValueChange={(value) => handleSelectChange('elasticity', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boa">Boa</SelectItem>
                    <SelectItem value="Razoável">Razoável</SelectItem>
                    <SelectItem value="Ruim">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="porosity">Porosidade</Label>
                 <Select name="porosity" value={formData.porosity || ''} onValueChange={(value) => handleSelectChange('porosity', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scalp_condition">Condição do Couro Cabeludo</Label>
                <Input id="scalp_condition" name="scalp_condition" value={formData.scalp_condition || ''} onChange={handleChange} placeholder="Normal, Oleoso, Seco, Sensível..." />
              </div>
            </div>
          </fieldset>

          {/* Coloration/Highlights Section */}
          <fieldset className="border p-4 rounded-md">
             <legend className="text-lg font-semibold px-2 text-primary dark:text-white">Coloração / Mechas</legend>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2 pt-6">
                    <Checkbox id="has_coloration" name="has_coloration" checked={formData.has_coloration || false} onCheckedChange={(checked) => handleCheckboxChange('has_coloration', checked)} />
                    <Label htmlFor="has_coloration">Possui Coloração?</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="coloration_details">Detalhes da Coloração</Label>
                    <Input id="coloration_details" name="coloration_details" value={formData.coloration_details || ''} onChange={handleChange} disabled={!formData.has_coloration} placeholder="Marca, cor, frequência..." />
                </div>
                 <div className="flex items-center space-x-2 pt-6">
                    <Checkbox id="has_highlights" name="has_highlights" checked={formData.has_highlights || false} onCheckedChange={(checked) => handleCheckboxChange('has_highlights', checked)} />
                    <Label htmlFor="has_highlights">Possui Mechas?</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="highlights_details">Detalhes das Mechas</Label>
                    <Input id="highlights_details" name="highlights_details" value={formData.highlights_details || ''} onChange={handleChange} disabled={!formData.has_highlights} placeholder="Técnica, frequência..." />
                </div>
             </div>
          </fieldset>

          {/* Chemical History Section */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-primary dark:text-white">Histórico Químico</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="previous_straightening">Alisamento Anterior</Label>
                <Select name="previous_straightening" value={formData.previous_straightening || ''} onValueChange={(value) => handleSelectChange('previous_straightening', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nenhum">Nenhum</SelectItem>
                    <SelectItem value="Formol">Formol / Derivados</SelectItem>
                    <SelectItem value="Guanidina">Guanidina</SelectItem>
                    <SelectItem value="Tioglicolato">Tioglicolato</SelectItem>
                    <SelectItem value="Outro">Outro Ácido / Progressiva</SelectItem>
                    <SelectItem value="Nao Sabe">Não Sabe Informar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_straightening_date">Data do Último Alisamento</Label>
                <Input id="last_straightening_date" name="last_straightening_date" type="date" value={formData.last_straightening_date || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="other_chemicals">Outras Químicas Recentes</Label>
                <Input id="other_chemicals" name="other_chemicals" value={formData.other_chemicals || ''} onChange={handleChange} placeholder="Permanente, Relaxamento..." />
              </div>
            </div>
          </fieldset>

          {/* Client Habits & Concerns Section */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-primary dark:text-white">Hábitos e Queixas</legend>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="hair_routine">Rotina Capilar</Label>
                <Textarea id="hair_routine" name="hair_routine" value={formData.hair_routine || ''} onChange={handleChange} placeholder="Frequência de lavagem, produtos usados em casa..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main_complaint">Principal Queixa</Label>
                <Textarea id="main_complaint" name="main_complaint" value={formData.main_complaint || ''} onChange={handleChange} placeholder="O que mais incomoda o cliente no cabelo?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desired_result">Resultado Desejado</Label>
                <Textarea id="desired_result" name="desired_result" value={formData.desired_result || ''} onChange={handleChange} placeholder="Qual o objetivo do cliente com o procedimento?" />
              </div>
            </div>
          </fieldset>

          {/* Health Information Section */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-primary dark:text-white">Informações de Saúde</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Input id="allergies" name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="Alguma alergia conhecida?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medication">Medicação em Uso</Label>
                <Input id="medication" name="medication" value={formData.medication || ''} onChange={handleChange} placeholder="Algum medicamento relevante?" />
              </div>
              <div className="flex items-center space-x-2 pt-6 md:col-span-2">
                <Checkbox id="is_pregnant_or_lactating" name="is_pregnant_or_lactating" checked={formData.is_pregnant_or_lactating || false} onCheckedChange={(checked) => handleCheckboxChange('is_pregnant_or_lactating', checked)} />
                <Label htmlFor="is_pregnant_or_lactating">Gestante ou Lactante?</Label>
              </div>
            </div>
          </fieldset>

          {/* Professional Analysis Section */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-primary dark:text-white">Análise Profissional</legend>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="strand_test_result">Resultado do Teste de Mecha</Label>
                <Textarea id="strand_test_result" name="strand_test_result" value={formData.strand_test_result || ''} onChange={handleChange} placeholder="Descreva o resultado do teste de mecha (elasticidade, resistência, compatibilidade)..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professional_observations">Observações Profissionais</Label>
                <Textarea id="professional_observations" name="professional_observations" value={formData.professional_observations || ''} onChange={handleChange} placeholder="Outras observações relevantes sobre o cabelo ou couro cabeludo..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommended_procedure">Procedimento Recomendado</Label>
                <Select name="recommended_procedure" value={formData.recommended_procedure || ''} onValueChange={(value) => handleSelectChange('recommended_procedure', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nivela Standard">Nivela Standard</SelectItem>
                    <SelectItem value="Nivela Blond">Nivela Blond (Cuidado Redobrado)</SelectItem>
                    <SelectItem value="Nao Recomendar">Não Recomendar Procedimento</SelectItem>
                    <SelectItem value="Outro">Outro Tratamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Anamnese'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AnamnesisForm;

