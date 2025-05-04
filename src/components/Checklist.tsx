
'use client';

import React, { useState, useEffect } from 'react';
import { ChecklistItemData, defaultChecklistItems } from '@/lib/checklistData';
import ChecklistItem from './ChecklistItem';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, RotateCcw } from 'lucide-react';

const Checklist = () => {
  // State now holds the full ChecklistItemData including the checked status
  const [items, setItems] = useState<ChecklistItemData[]>([]);

  // Load checklist items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('checklistItems');
    const initialItems = savedItems ? JSON.parse(savedItems) : defaultChecklistItems;

    // Ensure all items have a defined 'checked' property
    const itemsWithChecked = initialItems.map((item: ChecklistItemData) => ({
        ...item,
        checked: item.checked ?? false // Default to false if undefined
    }));

    setItems(itemsWithChecked);
  }, []);

  // Save items (including checked state) to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) { // Avoid saving empty initial state
        localStorage.setItem('checklistItems', JSON.stringify(items));
    }
  }, [items]);

  // Handler now receives the item ID and the new checked state
  const handleCheckChange = (itemId: string, isChecked: boolean) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, checked: isChecked } : item
      )
    );
  };

  const handleCheckAll = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, checked: true })));
  };

  const handleUncheckAll = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, checked: false })));
  };

  const handleResetDefaults = () => {
    const defaultItemsWithChecked = defaultChecklistItems.map(item => ({ ...item, checked: false }));
    setItems(defaultItemsWithChecked);
    localStorage.removeItem('checklistItems');
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-4 text-center">Checklist Pré-Aplicação</h2>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            item={item} // Pass the whole item object
            // The handler in ChecklistItem now takes only the boolean 'checked' value
            // We need to pass a function that knows the item's ID
            onCheckedChange={(isChecked) => handleCheckChange(item.id, isChecked)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleCheckAll}>
          <CheckSquare className="mr-2 h-4 w-4" /> Marcar Todos
        </Button>
        <Button variant="outline" size="sm" onClick={handleUncheckAll}>
          <Square className="mr-2 h-4 w-4" /> Desmarcar Todos
        </Button>
        <Button variant="ghost" size="sm" onClick={handleResetDefaults} className="text-muted-foreground hover:text-destructive">
          <RotateCcw className="mr-2 h-4 w-4" /> Resetar Padrão
        </Button>
      </div>
    </div>
  );
};

export default Checklist;

