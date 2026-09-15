export type Store = 'Lidl' | 'Super U' | 'Autre';

export interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  store: Store;
  price: number;
  checked: boolean;
}

export type StoreFilter = Store | 'Tous';
