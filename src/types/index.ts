export interface ClothingOffer {
  storeName: string;
  price: number;
  url: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  offers: ClothingOffer[];
}
