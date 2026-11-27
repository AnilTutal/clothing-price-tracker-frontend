import { useSyncExternalStore } from 'react';
import { WardrobeItem } from './wardrobe';

const KEY = 'savedOutfits';
const EVENT = 'saved-outfits-changed';

export interface SavedOutfit {
  id: string;
  title: string;
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  outer?: WardrobeItem;
  createdAt: string;
}

let cache: SavedOutfit[] | null = null;

function read(): SavedOutfit[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as SavedOutfit[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: SavedOutfit[]) {
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

export function useOutfits() {
  const outfits = useSyncExternalStore(subscribe, read);

  const saveOutfit = (title: string, top?: WardrobeItem, bottom?: WardrobeItem, outer?: WardrobeItem) => {
    const current = read();
    const newOutfit: SavedOutfit = {
      id: `outfit-${Date.now()}`,
      title: title.trim() || 'Yeni Kombin',
      top,
      bottom,
      outer,
      createdAt: new Date().toISOString(),
    };
    write([newOutfit, ...current]);
  };

  const removeOutfit = (id: string) => {
    write(read().filter((o) => o.id !== id));
  };

  return {
    outfits,
    saveOutfit,
    removeOutfit,
  };
}
