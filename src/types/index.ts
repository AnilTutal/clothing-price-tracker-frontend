export interface ClothingOffer {
  storeName: string;
  price: number;
  originalPrice?: number | null;
  discountRate?: number | null;
  url: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  galleryImages?: string[];
  description?: string | null;
  color?: string | null;
  fit?: string | null;
  material?: string | null;
  availableSizes?: string[];
  offers: ClothingOffer[];
}

export interface RecommendedItemDto {
  product: ClothingItem;
  similarityScore: number;
  priceDifference: number;
  matchReason: string;
}

export interface ProductRecommendationsResponse {
  targetProductId: string;
  engineName: string;
  engineMode: string;
  vectorDimensions: number;
  similarProducts: RecommendedItemDto[];
  complementaryProducts: RecommendedItemDto[];
}
