const KEY = 'lastViewedProduct';

export interface LastViewedProduct {
  id: string;
  name: string;
}

/** Kullanıcının son açtığı ürün detayını tarayıcıda saklar (menüdeki "Ürün Detay" linki için). */
export function setLastViewedProduct(product: LastViewedProduct) {
  try {
    localStorage.setItem(KEY, JSON.stringify(product));
  } catch {
    // localStorage kapalıysa sessizce geç
  }
}

export function getLastViewedProduct(): LastViewedProduct | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastViewedProduct) : null;
  } catch {
    return null;
  }
}
