import axios from 'axios';
import { ClothingItem, ProductRecommendationsResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5152/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// C# API'den dönen { message: "..." } hata mesajlarını tek merkezden yakalayan interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) {
      return Promise.reject(new Error(serverMessage));
    }
    return Promise.reject(error);
  }
);

const ALL_CATEGORY_QUERIES = ['tisort', 'jean', 'sweatshirt', 'gomlek', 'ceket'];

export async function fetchProducts(
  query = 'tisort',
  store = 'all',
  pageSize = 8
): Promise<ClothingItem[]> {
  // "all" (Tüm Kategoriler / Mağazanın Bütün Ürünleri) seçildiğinde tüm kategorileri paralel çekip birleştirir
  if (query.trim().toLowerCase() === 'all') {
    const perCategoryLimit =
      store.toLowerCase() === 'bershka' ? 8 : Math.max(pageSize, 50);

    const results = await Promise.all(
      ALL_CATEGORY_QUERIES.map((cat) =>
        apiClient
          .get<ClothingItem[]>('/products', {
            params: {
              q: cat,
              store: store && store !== 'all' ? store : undefined,
              pageSize: perCategoryLimit,
            },
          })
          .then((res) => res.data)
          .catch(() => [] as ClothingItem[])
      )
    );

    const seen = new Set<string>();
    const combined: ClothingItem[] = [];
    const maxLen = Math.max(0, ...results.map((r) => r.length));

    // Kategorileri dengeli sırayla (tişört, jean, sweatshirt, gömlek, ceket) harmanla ve tekilleştir
    for (let i = 0; i < maxLen; i++) {
      for (const list of results) {
        if (i < list.length) {
          const item = list[i];
          const key = `${item.brand}:${item.id}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }
      }
    }

    return combined;
  }

  const { data } = await apiClient.get<ClothingItem[]>('/products', {
    params: {
      q: query,
      store: store && store !== 'all' ? store : undefined,
      pageSize,
    },
  });
  return data;
}

export async function scrapeProductByUrl(urlOrCode: string): Promise<ClothingItem> {
  const { data } = await apiClient.get<ClothingItem>('/products/scrape', {
    params: { url: urlOrCode },
  });
  return data;
}

export interface PricePoint {
  date: string;
  price: number;
}

export async function fetchPriceHistory(id: string, days = 30): Promise<PricePoint[]> {
  const { data } = await apiClient.get<PricePoint[]>(
    `/products/${encodeURIComponent(id)}/price-history`,
    { params: { days } }
  );
  return data;
}

export async function fetchProductById(id: string): Promise<ClothingItem> {
  const { data } = await apiClient.get<ClothingItem>(`/products/${encodeURIComponent(id)}`);
  return data;
}

export async function fetchProductRecommendations(
  id: string
): Promise<ProductRecommendationsResponse> {
  const { data } = await apiClient.get<ProductRecommendationsResponse>(
    `/products/${encodeURIComponent(id)}/recommendations`
  );
  return data;
}

export async function fetchWardrobeStoreRecommendations(
  selectedItems: Array<{ name: string; category: string; color: string }>,
  targetCategory = 'all'
): Promise<ProductRecommendationsResponse> {
  const { data } = await apiClient.post<ProductRecommendationsResponse>(
    '/products/wardrobe-recommendations',
    {
      selectedItems,
      targetCategory,
    }
  );
  return data;
}



