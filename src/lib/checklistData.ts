
// Define the structure for a checklist item
export interface ChecklistItemData {
  id: string; // Unique ID for the item
  label: string; // Text description of the item
  checked: boolean; // Initial state
}

// Define the default checklist items based on common needs for Nivela application
export const defaultChecklistItems: ChecklistItemData[] = [
  { id: "nivela", label: "Produto Nivela®", checked: false },
  { id: "shampoo", label: "Shampoo Limpeza Profunda", checked: false },
  { id: "cumbuca", label: "Cumbuca Plástica", checked: false },
  { id: "pincel", label: "Pincel para Aplicação", checked: false },
  { id: "pente_fino", label: "Pente Fino (plástico)", checked: false },
  { id: "luvas", label: "Luvas Descartáveis", checked: false },
  { id: "toalhas", label: "Toalhas", checked: false },
  { id: "secador", label: "Secador de Cabelo", checked: false },
  { id: "escova_secagem", label: "Escova para Secagem", checked: false },
  { id: "prancha", label: "Prancha Profissional (com controle de temp.)", checked: false },
  { id: "presilhas", label: "Presilhas Plásticas", checked: false },
  { id: "touca", label: "Touca Plástica (opcional, p/ resistentes)", checked: false },
  { id: "borrifador", label: "Borrifador com Água (p/ umedecer na pausa)", checked: false },
  // Add more items as needed based on Bem Beauty's official recommendations
];

