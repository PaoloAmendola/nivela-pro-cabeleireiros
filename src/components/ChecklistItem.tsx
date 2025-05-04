
'use client';

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox"; // Assuming shadcn/ui checkbox
import { Label } from "@/components/ui/label";
import { ChecklistItemData } from '@/lib/checklistData';

interface ChecklistItemProps {
  item: ChecklistItemData;
  onCheckedChange: (checked: boolean) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onCheckedChange }) => {
  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    // The checkbox returns boolean or 'indeterminate', we only care about boolean
    if (typeof checked === 'boolean') {
      onCheckedChange(checked);
    }
  };

  return (
    <div className="flex items-center space-x-3 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <Checkbox 
        id={item.id}
        checked={item.checked}
        onCheckedChange={handleCheckboxChange}
        aria-labelledby={`label-${item.id}`}
      />
      <Label 
        htmlFor={item.id} 
        id={`label-${item.id}`}
        className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
      >
        {item.label}
      </Label>
    </div>
  );
};

export default ChecklistItem;

