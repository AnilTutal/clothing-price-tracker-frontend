import { useSyncExternalStore } from 'react';
import { ClothingItem } from '../types';

const KEY = 'wardrobeItems';
const EVENT = 'wardrobe-changed';

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  colorHex?: string;
  imageUrl?: string;
  brand?: string;
  productId?: string;
  source: 'manual' | 'store';
  addedAt: string;
}

let cache: WardrobeItem[] | null = null;

function read(): WardrobeItem[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as WardrobeItem[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: WardrobeItem[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage kapalıysa sessizce geç
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function useWardrobe() {
  const items = useSyncExternalStore(subscribe, read);

  const addManualItem = (name: string, category: string, color: string, colorHex?: string) => {
    const current = read();
    const newItem: WardrobeItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || `${color} ${category}`,
      category,
      color,
      colorHex,
      source: 'manual',
      addedAt: new Date().toISOString(),
    };
    write([newItem, ...current]);
  };

  const addStoreItem = (product: ClothingItem) => {
    const current = read();
    // Eğer aynı ürün kodu zaten varsa tekrar ekleme
    if (current.some((x) => x.productId === product.id)) return;

    const newItem: WardrobeItem = {
      id: `w-store-${product.id}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      color: product.color || 'Standart',
      imageUrl: product.imageUrl,
      brand: product.brand,
      source: 'store',
      addedAt: new Date().toISOString(),
    };
    write([newItem, ...current]);
  };

  const removeItem = (id: string) => {
    write(read().filter((x) => x.id !== id));
  };

  const isProductInWardrobe = (productId: string) => {
    return items.some((x) => x.productId === productId);
  };

  const toggleStoreItem = (product: ClothingItem) => {
    if (isProductInWardrobe(product.id)) {
      write(read().filter((x) => x.productId !== product.id));
    } else {
      addStoreItem(product);
    }
  };

  return {
    items,
    addManualItem,
    addStoreItem,
    removeItem,
    isProductInWardrobe,
    toggleStoreItem,
  };
}
