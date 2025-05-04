
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Removed unused CardDescription
import { Button } from '@/components/ui/button'; // Import Button
import { Bookmark, ExternalLink, FileText, Lightbulb, Video, Search, BookOpen } from 'lucide-react'; // Added BookOpen
import Image from 'next/image'; // Import next/image
// Removed unused Link import
import CourseList from './CourseList'; // Import CourseList

// Define interfaces based on DB structure
interface ContentCategory {
  id: string;
  name: string;
}

interface ContentItem {
  id: string;
  category_id?: string | null;
  type: 'article' | 'video_link' | 'pdf_link' | 'quick_tip' | 'external_link';
  title: string;
  content?: string | null;
  url?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  created_at: string;
}

interface UserFavorite {
  id: string;
  content_item_id: string;
}

// Helper to get icon based on type
const GetContentIcon = ({ type }: { type: ContentItem['type'] }) => {
  switch (type) {
    case 'article': return <FileText className="h-5 w-5 mr-2 text-primary" />;
    case 'video_link': return <Video className="h-5 w-5 mr-2 text-red-600" />;
    case 'pdf_link': return <FileText className="h-5 w-5 mr-2 text-red-700" />;
    case 'quick_tip': return <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />;
    case 'external_link': return <ExternalLink className="h-5 w-5 mr-2 text-blue-600" />;
    default: return <FileText className="h-5 w-5 mr-2 text-gray-500" />;
  }
};

const KnowledgeCenter = () => {
  const { supabase, session } = useAuth();
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Updated tabs: all_content, quick_tips, courses, favorites
  const [activeTab, setActiveTab] = useState('all_content');

  // Fetch initial data (categories, items, favorites)
  const fetchKnowledgeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('content_categories')
        .select('id, name')
        .order('name');
      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch All Content Items (initially)
      const { data: itemData, error: itemError } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (itemError) throw itemError;
      setItems(itemData || []);

      // Fetch User Favorites (if logged in)
      if (session?.user) {
        const { data: favData, error: favError } = await supabase
          .from('user_favorites')
          .select('id, content_item_id')
          .eq('user_id', session.user.id);
        if (favError) throw favError;
        setFavorites(favData || []);
      }

    } catch (err: unknown) { // Changed any to unknown
      console.error('Error fetching knowledge center data:', err);
      setError(`Erro ao carregar conteúdo. Tente novamente. ${err instanceof Error ? err.message : ''}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, session]);

  useEffect(() => {
    fetchKnowledgeData();
  }, [fetchKnowledgeData]);

  // Filter items based on search term, category, and active tab (excluding courses tab)
  const filteredItems = items.filter(item => {
    // Tab filter (only for content items, not courses)
    if (activeTab === 'quick_tips' && item.type !== 'quick_tip') return false;
    if (activeTab === 'favorites' && !favorites.some(fav => fav.content_item_id === item.id)) return false;

    // Category filter
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;

    // Search term filter (basic title search)
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });

  // Handle favorite toggle
  const toggleFavorite = async (itemId: string) => {
    if (!session?.user) {
      alert('Faça login para salvar favoritos.');
      return;
    }

    const isFavorite = favorites.some(fav => fav.content_item_id === itemId);

    try {
      if (isFavorite) {
        const favToRemove = favorites.find(fav => fav.content_item_id === itemId);
        if (favToRemove) {
          const { error: deleteError } = await supabase.from('user_favorites').delete().eq('id', favToRemove.id);
          if (deleteError) throw deleteError;
          setFavorites(favorites.filter(fav => fav.id !== favToRemove.id));
        }
      } else {
        const { data, error: insertError } = await supabase.from('user_favorites').insert({ user_id: session.user.id, content_item_id: itemId }).select().single();
        if (insertError) throw insertError;
        if (data) setFavorites([...favorites, data]);
      }
    } catch (err: unknown) { // Changed any to unknown
      console.error('Error toggling favorite:', err);
      alert(`Erro ao atualizar favoritos. ${err instanceof Error ? err.message : ''}`);
    }
  };

  const renderContentItems = () => {
    if (filteredItems.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum item encontrado.</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isFav = favorites.some(fav => fav.content_item_id === item.id);
          return (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                {item.image_url && (
                  <div className="relative w-full h-32 mb-2"> {/* Container for Image */}
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      unoptimized // Add if images are external
                    />
                  </div>
                )}
                <CardTitle className="text-base font-semibold flex items-start">
                  <GetContentIcon type={item.type} />
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-1">
                      {item.title}
                    </a>
                  ) : (
                    <span className="flex-1">{item.title}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {item.type === 'quick_tip' && item.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.content}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(item.id)}
                  disabled={!session}
                  title={isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                >
                  <Bookmark className={`h-4 w-4 ${isFav ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400'}`} />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div>Carregando Central de Conhecimento...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search and Filter Bar - Only show if not on Courses tab */}
      {activeTab !== 'courses' && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                  type="text"
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
              />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tabs for Content Type */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4"> {/* Updated to 4 columns */}
          <TabsTrigger value="all_content">Conteúdo</TabsTrigger>
          <TabsTrigger value="quick_tips">Dicas</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="inline h-4 w-4 mr-1"/>Cursos</TabsTrigger> {/* Added Courses Tab */}
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
        </TabsList>

        {/* Content Area - Render based on active tab */}
        <TabsContent value="all_content">
          {renderContentItems()}
        </TabsContent>
        <TabsContent value="quick_tips">
          {renderContentItems()}
        </TabsContent>
        <TabsContent value="courses">
          <CourseList /> {/* Render CourseList component here */}
        </TabsContent>
        <TabsContent value="favorites">
          {renderContentItems()}
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default KnowledgeCenter;

