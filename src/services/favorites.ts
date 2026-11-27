import { useSyncExternalStore } from 'react';
import { ClothingItem } from '../types';

const KEY = 'favoriteProducts';
const EVENT = 'favorites-changed';

export interface FavoriteProduct {
  id: string;
  brand: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  storeUrl?: string;
  addedAt: string;
}

const keyOf = (brand: string, id: string) => `${brand}:${id}`;

let cache: FavoriteProduct[] | null = null;

function read(): FavoriteProduct[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as FavoriteProduct[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: FavoriteProduct[]) {
  cache = list; // yeni referans: useSyncExternalStore değişimi fark eder
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage kapalıysa sadece bellekte tut
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // başka sekmede değişti
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

/** Favori listesini ve ekle/çıkar işlemlerini veren hook (localStorage tabanlı). */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, read);

  const isFavorite = (item: Pick<ClothingItem, 'id' | 'brand'>) =>
    favorites.some((f) => keyOf(f.brand, f.id) === keyOf(item.brand, item.id));

  const toggleFavorite = (item: ClothingItem) => {
    const current = read();
    if (current.some((f) => keyOf(f.brand, f.id) === keyOf(item.brand, item.id))) {
      write(current.filter((f) => keyOf(f.brand, f.id) !== keyOf(item.brand, item.id)));
      return;
    }
    const offer = item.offers[0];
    write([
      {
        id: item.id,
        brand: item.brand,
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl,
        price: offer?.price ?? 0,
        storeUrl: offer?.url,
        addedAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const removeFavorite = (brand: string, id: string) =>
    write(read().filter((f) => keyOf(f.brand, f.id) !== keyOf(brand, id)));

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
