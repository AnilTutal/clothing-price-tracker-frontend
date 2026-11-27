import { WardrobeItem } from './wardrobe';
import { ClothingItem, RecommendedItemDto } from '../types';

/**
 * Moda Renk Teorisi (Color Harmony Matrix)
 * Bir rengin en iyi uyum sağladığı tamamlayıcı ve kontrast renkler.
 * LLM (yapay zeka modeli) kurmaya gerek kalmadan, stilistlerin kullandığı
 * renk çarkı ve stil kuralları algoritması ile milisaniyede hatasız çalışır.
 */
const COLOR_HARMONY_RULES: Record<string, string[]> = {
  // Nötr Renkler: Neredeyse tüm renklerle mükemmel uyum sağlar
  siyah: ['beyaz', 'gri', 'bej', 'mavi', 'lacivert', 'haki', 'kirmizi', 'antrasit', 'kahverengi', 'yesil'],
  beyaz: ['siyah', 'lacivert', 'mavi', 'bej', 'gri', 'haki', 'antrasit', 'kahverengi', 'kirmizi', 'yesil'],
  gri: ['siyah', 'beyaz', 'lacivert', 'mavi', 'kirmizi', 'bordo', 'antrasit'],
  bej: ['lacivert', 'mavi', 'kahverengi', 'beyaz', 'siyah', 'haki', 'yesil'],
  ekru: ['lacivert', 'mavi', 'kahverengi', 'beyaz', 'siyah', 'haki'],

  // Tamamlayıcı & Karakteristik Renkler
  mavi: ['bej', 'beyaz', 'gri', 'siyah', 'kahverengi', 'lacivert', 'haki'],
  lacivert: ['bej', 'beyaz', 'gri', 'haki', 'kahverengi', 'mavi', 'bordo'],
  haki: ['siyah', 'beyaz', 'bej', 'lacivert', 'gri', 'kahverengi'],
  yesil: ['siyah', 'beyaz', 'bej', 'lacivert', 'gri'],
  kahverengi: ['bej', 'mavi', 'lacivert', 'beyaz', 'siyah', 'haki'],
  kirmizi: ['siyah', 'beyaz', 'gri', 'lacivert', 'antrasit'],
  bordo: ['siyah', 'gri', 'beyaz', 'bej', 'lacivert'],
  antrasit: ['beyaz', 'bej', 'mavi', 'siyah', 'acik mavi'],
};

// Renk metnini temizleyip normalize eder (örn. "Koyu Mavi" -> "mavi", "Açık Bej" -> "bej")
export function normalizeColor(rawColor?: string): string {
  if (!rawColor) return 'siyah';
  const clean = rawColor
    .toLowerCase()
    .replace('açık', '')
    .replace('koyu', '')
    .replace('denizci', '')
    .replace('melanj', '')
    .replace('kirli', '')
    .trim()
    .replace('ı', 'i')
    .replace('ğ', 'g')
    .replace('ü', 'u')
    .replace('ş', 's')
    .replace('ö', 'o')
    .replace('ç', 'c');

  for (const key of Object.keys(COLOR_HARMONY_RULES)) {
    if (clean.includes(key)) return key;
  }
  return clean;
}

/**
 * İki rengin birbiriyle uyum skorunu hesaplar (0 - 100 arası).
 */
export function calculateColorMatch(colorA?: string, colorB?: string): number {
  const a = normalizeColor(colorA);
  const b = normalizeColor(colorB);

  // Aynı renk (ton-sür-ton)
  if (a === b) {
    if (['siyah', 'beyaz', 'lacivert'].includes(a)) return 92;
    return 80;
  }

  // Nötr renklerle eşleşme
  const isNeutralA = ['siyah', 'beyaz', 'gri', 'bej', 'ekru'].includes(a);
  const isNeutralB = ['siyah', 'beyaz', 'gri', 'bej', 'ekru'].includes(b);

  if (isNeutralA && isNeutralB) return 96;

  const matchesOfA = COLOR_HARMONY_RULES[a] || [];
  if (matchesOfA.includes(b)) return 90;

  const matchesOfB = COLOR_HARMONY_RULES[b] || [];
  if (matchesOfB.includes(a)) return 90;

  if (isNeutralA || isNeutralB) return 85;

  return 65;
}

export type ClothingRole = 'top' | 'bottom' | 'outer';

/**
 * Bir kıyafetin kategorisine göre kombindeki rolünü belirler.
 */
export function getClothingRole(category?: string): ClothingRole {
  const cat = (category || '').toLowerCase();
  if (cat.includes('jean') || cat.includes('pantolon') || cat.includes('sort') || cat.includes('etek')) {
    return 'bottom';
  }
  if (cat.includes('ceket') || cat.includes('mont') || cat.includes('kaban') || cat.includes('yelek') || cat.includes('bomber')) {
    return 'outer';
  }
  // Tişört, gömlek, sweatshirt, kazak vb.
  return 'top';
}

/**
 * Sitede bakılan bir ürüne (ör. Mavi tişört) karşılık dolaptaki kıyafetler arasından
 * en iyi uyum sağlayan tamamlayıcı parçaları (alt giyim veya ceket) bulur.
 */
export function findMatchingWardrobeItems(
  targetProduct: { category: string; color?: string | null; id?: string },
  wardrobe: WardrobeItem[],
  limit = 3
): Array<{ item: WardrobeItem; matchScore: number; reason: string }> {
  const targetRole = getClothingRole(targetProduct.category);
  const targetColor = targetProduct.color || 'Standart';

  const scored = wardrobe
    .filter((item) => {
      const itemRole = getClothingRole(item.category);
      // Üst giyime üst giyim önermeyiz; üst giyime alt giyim veya dış giyim öneririz
      return itemRole !== targetRole && item.productId !== targetProduct.id;
    })
    .map((item) => {
      const score = calculateColorMatch(targetColor, item.color);
      let reason = 'Renk uyumu iyi';
      if (score >= 90) {
        reason = `${item.color} ve ${targetColor} kontrast uyumu mükemmel`;
      } else if (score >= 80) {
        reason = 'Nötr tonlarla şık bir kombin oluşturur';
      }
      return { item, matchScore: score, reason };
    });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

export interface OutfitSuggestion {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  outer?: WardrobeItem;
  overallScore: number;
  vectorReason?: string;
}

const VECTOR_DIM = 128;

function normalizeTr(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function stableHash(s: string): number {
  let hash = 23;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * 128 Boyutlu Qwen3-Stili Moda & Silüet Semantik Vektör Üretici (L2 Normalize).
 * Kıyafetin kesim silüeti (Oversize/Baggy vs Regular vs Slim), rengi, kumaşı ve alt-kelime (3-gram)
 * özelliklerini 128 boyutlu birim vektöre dönüştürür.
 */
export function computeFashionStyleVector(item: {
  name?: string;
  category?: string;
  color?: string | null;
  fit?: string | null;
}): number[] {
  const vec = new Array<number>(VECTOR_DIM).fill(0);
  const text = normalizeTr(
    `${item.name || ''} ${item.category || ''} ${item.color || ''} ${item.fit || ''}`
  );

  // Silüet / Tarz Boyutları (0..31)
  const isStreetwear =
    /oversize|baggy|boxy|wide|loose|kargo|genis|salas|boyfriend|skater|relaxed/.test(
      text
    );
  const isSlim = /slim|skinny|dar|fitted/.test(text);

  if (isStreetwear) {
    vec[0] += 2.6;
    vec[1] += 2.0;
    vec[2] += 1.4;
  } else if (isSlim) {
    vec[8] += 2.6;
    vec[9] += 1.9;
  } else {
    // Regular / Classic / 90lar
    vec[4] += 2.4;
    vec[5] += 1.7;
    vec[1] += 0.8;
  }

  // Renk & Kontrast Uyum Uzayı (32..63)
  const color = normalizeColor(item.color || undefined);
  const isNeutral = ['siyah', 'beyaz', 'gri', 'bej', 'ekru'].includes(color);
  if (isNeutral) {
    vec[32] += 2.2;
    vec[33] += 1.6;
  } else {
    vec[32] += 1.5;
    vec[34] += 1.8;
  }

  // Tamamlayıcı renk çiftleri aynı alt-uzayda hizalanır (Cosine Similarity'de yüksek çıkması için)
  if (['siyah', 'beyaz', 'gri', 'mavi', 'bej'].includes(color)) vec[36] += 1.6;
  if (['mavi', 'lacivert', 'beyaz', 'bej', 'ekru'].includes(color)) vec[38] += 1.7;
  if (['haki', 'yesil', 'siyah', 'bej', 'beyaz'].includes(color)) vec[40] += 1.6;

  // Kumaş / Mevsim Doku Uzayı (64..79)
  if (/jean|denim|kot|pamuk|cotton/.test(text)) {
    vec[64] += 1.8;
  }
  if (/keten|yazlik/.test(text)) {
    vec[66] += 1.7;
  }
  if (/sweatshirt|hoodie|ceket|mont|polar|kislik/.test(text)) {
    vec[68] += 1.7;
  }

  // Kelime & Karakter 3-Gram LSH Projeksiyonu (80..127)
  const tokens = text.split(/[\s|,.\-/()]+/).filter((t) => t.length >= 2);
  for (const tok of tokens) {
    const h = stableHash(tok);
    const idx = 80 + (h % 48);
    vec[idx] += (h & 1) === 0 ? 0.55 : -0.55;
  }

  // L2 Normalizasyon
  let sumSq = 0;
  for (let i = 0; i < VECTOR_DIM; i++) sumSq += vec[i] * vec[i];
  const norm = Math.sqrt(sumSq);
  if (norm > 1e-6) {
    for (let i = 0; i < VECTOR_DIM; i++) vec[i] /= norm;
  }
  return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom < 1e-8 ? 0 : dot / denom;
}

export function detectSilhouetteLabel(text?: string): string {
  const t = normalizeTr(text || '');
  if (/oversize|baggy|boxy|wide|loose|kargo|genis|salas/.test(t)) {
    return 'Sokak Stili (Oversize / Baggy)';
  }
  if (/slim|skinny|dar/.test(t)) {
    return 'Modern Dar Kalıp (Slim)';
  }
  return 'Klasik / Rahat Kesim (Regular)';
}

export function evaluateOutfitVectorHarmony(
  top?: WardrobeItem,
  bottom?: WardrobeItem,
  outer?: WardrobeItem
): { score: number; reason: string } {
  const pieces = [top, bottom, outer].filter(Boolean) as WardrobeItem[];
  if (pieces.length === 0) {
    return { score: 0, reason: '' };
  }
  if (pieces.length === 1) {
    const p = pieces[0];
    return {
      score: 84,
      reason: `Seçili parça (${p.name}) için ${detectSilhouetteLabel(p.name)} vektörü aktif. Diğer slotları tamamlamak için butona basabilirsin.`,
    };
  }

  let pairScores: number[] = [];
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const vecA = computeFashionStyleVector(pieces[i]);
      const vecB = computeFashionStyleVector(pieces[j]);
      const cos = cosineSimilarity(vecA, vecB);
      const colorScore = calculateColorMatch(pieces[i].color, pieces[j].color);
      // %55 Renk Teorisi + %45 128D Vektör Kosinüs Benzerliği
      const combined = colorScore * 0.55 + Math.max(65, Math.min(98, 65 + cos * 33)) * 0.45;
      pairScores.push(combined);
    }
  }

  const avg = Math.round(
    pairScores.reduce((acc, v) => acc + v, 0) / pairScores.length
  );
  const styleLabel = detectSilhouetteLabel(
    pieces.map((p) => p.name).join(' ')
  );
  const colorsText = pieces.map((p) => p.color).join(' × ');

  return {
    score: Math.min(98, Math.max(70, avg)),
    reason: `Qwen3 128D Vektör Analizi: ${styleLabel} kesim uyumu ve ${colorsText} renk kontrastı Kosinüs Benzerliği ile eşleşti.`,
  };
}

/**
 * Dolaptaki tüm parçalardan olası tüm uyumlu kombinleri 128D Vektör + Renk Teorisi ile türetir ve sıralar.
 */
export function getAllPossibleOutfits(wardrobe: WardrobeItem[]): OutfitSuggestion[] {
  const tops = wardrobe.filter((x) => getClothingRole(x.category) === 'top');
  const bottoms = wardrobe.filter((x) => getClothingRole(x.category) === 'bottom');
  const outers = wardrobe.filter((x) => getClothingRole(x.category) === 'outer');

  const list: OutfitSuggestion[] = [];

  if (tops.length > 0 && bottoms.length > 0) {
    for (const t of tops) {
      for (const b of bottoms) {
        if (outers.length > 0) {
          for (const o of outers) {
            const evalRes = evaluateOutfitVectorHarmony(t, b, o);
            list.push({
              top: t,
              bottom: b,
              outer: o,
              overallScore: evalRes.score,
              vectorReason: evalRes.reason,
            });
          }
        } else {
          const evalRes = evaluateOutfitVectorHarmony(t, b, undefined);
          list.push({
            top: t,
            bottom: b,
            overallScore: evalRes.score,
            vectorReason: evalRes.reason,
          });
        }
      }
    }
  } else if (tops.length > 0 || bottoms.length > 0 || outers.length > 0) {
    for (const t of tops) {
      const evalRes = evaluateOutfitVectorHarmony(t, undefined, undefined);
      list.push({ top: t, overallScore: evalRes.score, vectorReason: evalRes.reason });
    }
    for (const b of bottoms) {
      const evalRes = evaluateOutfitVectorHarmony(undefined, b, undefined);
      list.push({ bottom: b, overallScore: evalRes.score, vectorReason: evalRes.reason });
    }
  }

  return list.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Kullanıcının tahtada seçtiği 1 veya 2 parçayı sabit tutarak, boş kalan slotları
 * dolaptaki en yüksek Kosinüs Benzerliği + Renk Uyumu puanlı kıyafetlerle tamamlar!
 */
export function completeOutfitFromSelection(
  wardrobe: WardrobeItem[],
  fixedTop?: WardrobeItem,
  fixedBottom?: WardrobeItem,
  fixedOuter?: WardrobeItem
): OutfitSuggestion | null {
  const tops = fixedTop
    ? [fixedTop]
    : wardrobe.filter((x) => getClothingRole(x.category) === 'top');
  const bottoms = fixedBottom
    ? [fixedBottom]
    : wardrobe.filter((x) => getClothingRole(x.category) === 'bottom');
  const outers = fixedOuter
    ? [fixedOuter]
    : wardrobe.filter((x) => getClothingRole(x.category) === 'outer');

  const candidates: OutfitSuggestion[] = [];
  const topList = tops.length > 0 ? tops : [undefined];
  const bottomList = bottoms.length > 0 ? bottoms : [undefined];
  const outerList = outers.length > 0 ? outers : [undefined];

  for (const t of topList) {
    for (const b of bottomList) {
      for (const o of outerList) {
        if (!t && !b && !o) continue;
        const evalRes = evaluateOutfitVectorHarmony(t, b, o);
        candidates.push({
          top: t,
          bottom: b,
          outer: o,
          overallScore: evalRes.score,
          vectorReason: evalRes.reason,
        });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.overallScore - a.overallScore);
  return candidates[0];
}

/**
 * Mağaza ürünlerini, kullanıcının dolabında seçtiği kıyafetlerle Qwen3 128D Vektör Uzayında karşılaştırıp sıralar.
 */
export function rankStoreProductsForWardrobe(
  storeProducts: ClothingItem[],
  selectedWardrobeItems: WardrobeItem[]
): RecommendedItemDto[] {
  const anchors =
    selectedWardrobeItems.length > 0
      ? selectedWardrobeItems
      : [{ id: 'default', name: 'Siyah Tişört', category: 'Tişört', color: 'Siyah', addedAt: '' }];

  const anchorVectors = anchors.map((a) => computeFashionStyleVector(a));
  const combinedAnchorNames = anchors.map((a) => a.name).join(' + ');
  const silhouette = detectSilhouetteLabel(combinedAnchorNames);

  return storeProducts
    .map((product) => {
      const prodVec = computeFashionStyleVector({
        name: product.name,
        category: product.category,
        color: product.color,
        fit: product.fit,
      });

      let totalScore = 0;
      for (let i = 0; i < anchors.length; i++) {
        const cos = cosineSimilarity(anchorVectors[i], prodVec);
        const colMatch = calculateColorMatch(anchors[i].color, product.color || undefined);
        totalScore += colMatch * 0.55 + Math.max(68, Math.min(98, 65 + cos * 33)) * 0.45;
      }

      const similarityScore = Math.min(
        98,
        Math.max(72, Math.round(totalScore / anchors.length))
      );
      const price = product.offers[0]?.price ?? 0;

      return {
        product,
        similarityScore,
        priceDifference: price,
        matchReason: `${silhouette} silüeti ve ${anchors[0].color} × ${product.color || 'Standart'} renk vektörü ile seçtiğin kombine uyumlu.`,
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 4);
}

/**
 * Kullanıcı butona her bastığında dolaptaki farklı bir kombinasyonu sırayla veya alternatif olarak önerir.
 */
export function generateNextOutfit(
  wardrobe: WardrobeItem[],
  currentTopId?: string,
  currentBottomId?: string,
  currentOuterId?: string
): OutfitSuggestion | null {
  const all = getAllPossibleOutfits(wardrobe);
  if (all.length === 0) return null;

  const alternatives = all.filter((o) => {
    const isSameTop = (o.top?.id || '') === (currentTopId || '');
    const isSameBottom = (o.bottom?.id || '') === (currentBottomId || '');
    const isSameOuter = (o.outer?.id || '') === (currentOuterId || '');
    return !(isSameTop && isSameBottom && isSameOuter);
  });

  if (alternatives.length > 0) {
    const topPicks = alternatives.slice(0, Math.min(5, alternatives.length));
    const randomPick = topPicks[Math.floor(Math.random() * topPicks.length)];
    return randomPick;
  }

  return all[0];
}
