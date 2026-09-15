import type { ShoppingItem } from '../types';

/** Liste type semaine high-protein cut — Lidl / Super U Voiron–Saint-Cassien */
export const SEED_ITEMS: ShoppingItem[] = [
  { id: '1', name: 'Blanc de poulet', qty: '2 kg', store: 'Lidl', price: 11.98, checked: false },
  { id: '2', name: 'Skyr nature', qty: '8 pots', store: 'Lidl', price: 7.92, checked: false },
  { id: '3', name: 'Œufs XL', qty: '18', store: 'Lidl', price: 3.49, checked: false },
  { id: '4', name: 'Riz basmati', qty: '1 kg', store: 'Lidl', price: 1.79, checked: false },
  { id: '5', name: 'Flocons d’avoine', qty: '1 kg', store: 'Lidl', price: 1.29, checked: false },
  { id: '6', name: 'Légumes surgelés mix', qty: '2 sacs', store: 'Lidl', price: 3.58, checked: false },
  { id: '7', name: 'Brocolis surgelés', qty: '1 kg', store: 'Lidl', price: 1.89, checked: false },
  { id: '8', name: 'Thon au naturel', qty: '6 boîtes', store: 'Lidl', price: 5.94, checked: false },
  { id: '9', name: 'Fromage blanc 0%', qty: '8 pots', store: 'Lidl', price: 4.72, checked: false },
  { id: '10', name: 'Bananes', qty: '1 kg', store: 'Lidl', price: 1.29, checked: false },
  { id: '11', name: 'Whey / protéine', qty: '1 pot', store: 'Autre', price: 24.99, checked: false },
  { id: '12', name: 'Poitrine de dinde', qty: '800 g', store: 'Super U', price: 7.60, checked: false },
  { id: '13', name: 'Saumon frais', qty: '400 g', store: 'Super U', price: 6.80, checked: false },
  { id: '14', name: 'Yaourt grec 0%', qty: '12 pots', store: 'Super U', price: 5.40, checked: false },
  { id: '15', name: 'Haricots verts surgelés', qty: '1 kg', store: 'Super U', price: 2.15, checked: false },
  { id: '16', name: 'Patates douces', qty: '1,5 kg', store: 'Super U', price: 2.99, checked: false },
  { id: '17', name: 'Épinards frais', qty: '2 sachets', store: 'Super U', price: 2.58, checked: false },
  { id: '18', name: 'Huile d’olive', qty: '50 cl', store: 'Super U', price: 4.50, checked: false },
  { id: '19', name: 'Cottage cheese', qty: '4 pots', store: 'Lidl', price: 3.96, checked: false },
  { id: '20', name: 'Jambon blanc découenné', qty: '2 × 4 tr.', store: 'Lidl', price: 3.78, checked: false },
  { id: '21', name: 'Concombres', qty: '3', store: 'Lidl', price: 1.77, checked: false },
  { id: '22', name: 'Tomates cerises', qty: '500 g', store: 'Lidl', price: 1.99, checked: false },
];

export const STORAGE_KEY = 'courses-mobile-v1';
