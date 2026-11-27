import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiArrowRight,
  FiCpu,
  FiFolder,
  FiInfo,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiRotateCcw,
  FiSave,
  FiShield,
  FiShoppingBag,
  FiTarget,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { FaMagic, FaTshirt } from 'react-icons/fa';
import { useI18n } from '../../i18n/I18nProvider';
import { useWardrobe, WardrobeItem } from '../../services/wardrobe';
import { useOutfits } from '../../services/outfitStorage';
import {
  completeOutfitFromSelection,
  detectSilhouetteLabel,
  evaluateOutfitVectorHarmony,
  generateNextOutfit,
  getAllPossibleOutfits,
  getClothingRole,
  rankStoreProductsForWardrobe,
} from '../../services/outfitMatcher';
import { fetchProducts, fetchWardrobeStoreRecommendations } from '../../services/api';
import { ClothingItem, RecommendedItemDto } from '../../types';
import './OutfitStudio.scss';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);

const OutfitStudio = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const { items, addStoreItem } = useWardrobe();
  const { outfits, saveOutfit, removeOutfit } = useOutfits();

  const [selectedTop, setSelectedTop] = useState<WardrobeItem | undefined>();
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | undefined>();
  const [selectedOuter, setSelectedOuter] = useState<WardrobeItem | undefined>();
  const [outfitTitle, setOutfitTitle] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [vectorReason, setVectorReason] = useState<string>('');
  const [suggestionNotice, setSuggestionNotice] = useState<string | null>(null);

  // Mağazalardan Qwen3-Embedding ile kombin tamamlama state'leri
  const [storeRecCategory, setStoreRecCategory] = useState<string>('auto');
  const [storeRecs, setStoreRecs] = useState<RecommendedItemDto[]>([]);
  const [storeRecsLoading, setStoreRecsLoading] = useState<boolean>(false);

  const tops = items.filter((x) => getClothingRole(x.category) === 'top');
  const bottoms = items.filter((x) => getClothingRole(x.category) === 'bottom');
  const outers = items.filter((x) => getClothingRole(x.category) === 'outer');

  const updateLiveVectorScore = (
    top?: WardrobeItem,
    bottom?: WardrobeItem,
    outer?: WardrobeItem
  ) => {
    const evalRes = evaluateOutfitVectorHarmony(top, bottom, outer);
    if (evalRes.score > 0) {
      setMatchScore(evalRes.score);
      setVectorReason(evalRes.reason);
    } else {
      setMatchScore(null);
      setVectorReason('');
    }
  };

  // Dolabım sayfasından "?piece=..." parametresiyle gelindiyse o parçayı ilgili slota yerleştir
  useEffect(() => {
    const pieceId = searchParams.get('piece');
    if (!pieceId || items.length === 0) return;

    const target = items.find((x) => x.id === pieceId);
    if (!target) return;

    const role = getClothingRole(target.category);
    const nextTop = role === 'top' ? target : selectedTop;
    const nextBottom = role === 'bottom' ? target : selectedBottom;
    const nextOuter = role === 'outer' ? target : selectedOuter;

    setSelectedTop(nextTop);
    setSelectedBottom(nextBottom);
    setSelectedOuter(nextOuter);
    updateLiveVectorScore(nextTop, nextBottom, nextOuter);
  }, [searchParams, items]);

  const handleAutoSuggestOutfit = () => {
    setSuggestionNotice(null);
    const allOutfits = getAllPossibleOutfits(items);

    if (allOutfits.length === 0) {
      setSuggestionNotice(
        'Kombin oluşturmak için önce Dolabım sayfasından en az 1 üst ve 1 alt kıyafet eklemelisin.'
      );
      return;
    }

    const next = generateNextOutfit(
      items,
      selectedTop?.id,
      selectedBottom?.id,
      selectedOuter?.id
    );
    if (next) {
      setSelectedTop(next.top);
      setSelectedBottom(next.bottom);
      setSelectedOuter(next.outer);
      setMatchScore(next.overallScore);
      setVectorReason(next.vectorReason || '');

      if (allOutfits.length === 1) {
        setSuggestionNotice(
          'Dolabındaki mevcut kıyafetlerle oluşturulabilecek tek kombinasyon bu. Daha fazla alternatif için Dolabım sayfasından yeni kıyafetler ekleyebilirsin!'
        );
      }
    }
  };

  const handleCompleteFromSelection = () => {
    setSuggestionNotice(null);
    if (!selectedTop && !selectedBottom && !selectedOuter) {
      handleAutoSuggestOutfit();
      return;
    }

    const completed = completeOutfitFromSelection(
      items,
      selectedTop,
      selectedBottom,
      selectedOuter
    );
    if (completed) {
      setSelectedTop(completed.top);
      setSelectedBottom(completed.bottom);
      setSelectedOuter(completed.outer);
      setMatchScore(completed.overallScore);
      setVectorReason(completed.vectorReason || '');
    }
  };

  const handleClearBoard = () => {
    setSelectedTop(undefined);
    setSelectedBottom(undefined);
    setSelectedOuter(undefined);
    setMatchScore(null);
    setVectorReason('');
    setSuggestionNotice(null);
  };

  const handleSaveOutfit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTop && !selectedBottom && !selectedOuter) return;
    saveOutfit(outfitTitle, selectedTop, selectedBottom, selectedOuter);
    setOutfitTitle('');
  };

  const handleFetchStoreOutfitRecs = async (overrideCat?: string) => {
    const cat = overrideCat ?? storeRecCategory;
    const anchors = [selectedTop, selectedBottom, selectedOuter].filter(
      Boolean
    ) as WardrobeItem[];
    const sourceItems = anchors.length > 0 ? anchors : items.slice(0, 3);

    let queryCat = cat;
    if (cat === 'auto') {
      if (selectedTop && !selectedBottom) queryCat = 'jean';
      else if (!selectedTop && selectedBottom) queryCat = 'tisort';
      else if (selectedTop && selectedBottom && !selectedOuter) queryCat = 'ceket';
      else queryCat = 'jean';
    }

    try {
      setStoreRecsLoading(true);
      const payload = sourceItems.map((x) => ({
        name: x.name,
        category: x.category,
        color: x.color,
      }));
      const resp = await fetchWardrobeStoreRecommendations(payload, queryCat);
      if (resp.complementaryProducts && resp.complementaryProducts.length > 0) {
        setStoreRecs(resp.complementaryProducts);
        return;
      }
    } catch {
      // Backend henüz yeniden başlatılmadıysa yerel 128D Qwen3 Vektör Motoru ile sırala
    } finally {
      setStoreRecsLoading(false);
    }

    try {
      setStoreRecsLoading(true);
      const candidates = await fetchProducts(queryCat, 'all', 16);
      const ranked = rankStoreProductsForWardrobe(candidates, sourceItems);
      setStoreRecs(ranked);
    } catch {
      setStoreRecs([]);
    } finally {
      setStoreRecsLoading(false);
    }
  };

  const handleApplyStoreItemToOutfit = (storeItem: ClothingItem) => {
    addStoreItem(storeItem);
    const newWardrobePiece: WardrobeItem = {
      id: `store-${storeItem.id}`,
      name: storeItem.name,
      category: storeItem.category,
      color: storeItem.color || 'Standart',
      brand: storeItem.brand,
      imageUrl: storeItem.imageUrl,
      productId: storeItem.id,
      source: 'store',
      addedAt: new Date().toISOString(),
    };
    const role = getClothingRole(storeItem.category);
    const nextTop = role === 'top' ? newWardrobePiece : selectedTop;
    const nextBottom = role === 'bottom' ? newWardrobePiece : selectedBottom;
    const nextOuter = role === 'outer' ? newWardrobePiece : selectedOuter;
    setSelectedTop(nextTop);
    setSelectedBottom(nextBottom);
    setSelectedOuter(nextOuter);
    updateLiveVectorScore(nextTop, nextBottom, nextOuter);
  };

  const activePieces = [selectedTop, selectedBottom, selectedOuter].filter(
    Boolean
  ) as WardrobeItem[];
  const detectedStyle =
    activePieces.length > 0
      ? detectSilhouetteLabel(activePieces.map((p) => p.name).join(' '))
      : null;

  return (
    <div className="outfit-studio-page">
      {/* Üst Başlık ve İstatistik Barı */}
      <header className="studio-hero">
        <div className="studio-hero__left">
          <div className="studio-badge">
            <FiCpu /> Qwen/Qwen3-Embedding-0.6B • 128D Cosine Vector Studio
          </div>
          <h1>
            <FaMagic style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Yapay Zeka Kombin Stüdyosu
          </h1>
          <p>
            Dolabındaki kıyafetleri seçerek veya tek tıkla vektör algoritmasına
            bırakarak stil silüetine ve renk teorisine uygun kombinler tasarla;
            eksik parçaları mağazalardan tamamla.
          </p>
        </div>

        <div className="studio-hero__right">
          <div className="studio-kpis">
            <div className="kpi-box">
              <strong>{items.length}</strong>
              <span>Dolaptaki Parça</span>
            </div>
            <div className="kpi-box">
              <strong>{outfits.length}</strong>
              <span>Kayıtlı Kombin</span>
            </div>
          </div>
          <Link to="/wardrobe" className="btn-go-wardrobe">
            <FaTshirt /> Dolabımı Yönet ({items.length}) <FiArrowRight />
          </Link>
        </div>
      </header>

      {/* Ana Kombin Çalışma Alanı (Canvas + Yan Kontrol Paneli) */}
      <section className="studio-workspace">
        <div className="workspace-toolbar">
          <div className="toolbar-left">
            <h2>Kombin Tahtası (Lookbook Canvas)</h2>
            {detectedStyle && (
              <span className="silhouette-pill">Silüet: {detectedStyle}</span>
            )}
          </div>

          <div className="toolbar-actions">
            {(selectedTop || selectedBottom || selectedOuter) && (
              <>
                <button
                  type="button"
                  className="btn-studio btn-studio--outline"
                  onClick={handleCompleteFromSelection}
                  disabled={items.length === 0}
                >
                  <FiTarget /> Seçili Parçaya Göre Dolaptan Tamamla
                </button>
                <button
                  type="button"
                  className="btn-studio btn-studio--ghost"
                  onClick={handleClearBoard}
                >
                  <FiRotateCcw /> Temizle
                </button>
              </>
            )}
            <button
              type="button"
              className="btn-studio btn-studio--primary"
              onClick={handleAutoSuggestOutfit}
              disabled={items.length === 0}
            >
              {matchScore !== null ? (
                <>
                  <FiRefreshCw /> {t('PAGE.WARDROBE.BTN_NEXT_OUTFIT')}
                </>
              ) : (
                <>
                  <FaMagic /> {t('PAGE.WARDROBE.BTN_SUGGEST_OUTFIT')}
                </>
              )}
            </button>
          </div>
        </div>

        {suggestionNotice && (
          <div className="studio-notice">
            <FiInfo />
            <span>{suggestionNotice}</span>
            <Link to="/wardrobe" className="notice-link">
              Dolabıma Kıyafet Ekle →
            </Link>
          </div>
        )}

        {/* Qwen3 Vektör & Renk Uyumu Canlı Gösterge Barı */}
        {matchScore !== null && (
          <div className="vector-harmony-card">
            <div className="harmony-meter">
              <div className="meter-top">
                <span className="meter-label">
                  <FiTarget /> Qwen3 Vektör & Renk Uyumu Skoru
                </span>
                <strong className="meter-value">%{matchScore}</strong>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${Math.min(100, matchScore)}%` }}
                />
              </div>
            </div>
            {vectorReason && <p className="harmony-desc">{vectorReason}</p>}
          </div>
        )}

        {/* 3 Slotlu Profesyonel Kombin Tahtası */}
        <div className="studio-slots-grid">
          {/* 1. ÜST GİYİM SLOTU */}
          <div className={`studio-slot ${selectedTop ? 'is-filled' : ''}`}>
            <div className="slot-head">
              <span className="slot-role">
                <FaTshirt /> {t('PAGE.WARDROBE.SLOT_TOP')}
              </span>
              {selectedTop && (
                <button
                  type="button"
                  className="slot-clear"
                  onClick={() => {
                    setSelectedTop(undefined);
                    updateLiveVectorScore(undefined, selectedBottom, selectedOuter);
                  }}
                  title="Slottan Çıkar"
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={selectedTop?.id || ''}
              onChange={(e) => {
                const nextTop = tops.find((x) => x.id === e.target.value);
                setSelectedTop(nextTop);
                updateLiveVectorScore(nextTop, selectedBottom, selectedOuter);
              }}
              className="slot-dropdown"
            >
              <option value="">
                {t('PAGE.WARDROBE.SELECT_FROM_WARDROBE')} ({tops.length})
              </option>
              {tops.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.color})
                </option>
              ))}
            </select>

            {selectedTop ? (
              <div className="slot-card">
                <div className="slot-card__visual">
                  {selectedTop.imageUrl ? (
                    <img src={selectedTop.imageUrl} alt={selectedTop.name} />
                  ) : (
                    <div
                      className="slot-swatch"
                      style={{
                        backgroundColor: selectedTop.colorHex || '#3b82f6',
                        color: ['#f9fafb', '#e2d5c3', '#ffffff'].includes(
                          selectedTop.colorHex || ''
                        )
                          ? '#111827'
                          : '#ffffff',
                      }}
                    >
                      <FaTshirt />
                    </div>
                  )}
                </div>
                <div className="slot-card__meta">
                  <span className="cat-tag">{selectedTop.category}</span>
                  <h4>{selectedTop.name}</h4>
                  <span className="color-tag">{selectedTop.color}</span>
                </div>
              </div>
            ) : (
              <div className="slot-empty">
                <FiPlus className="empty-plus" />
                <span>{t('PAGE.WARDROBE.EMPTY_SLOT')}</span>
                <small>Yukarıdaki listeden veya aşağıdan hızlı seç</small>
              </div>
            )}

            {tops.length > 0 && (
              <div className="quick-pick-strip">
                {tops.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`quick-pill ${
                      selectedTop?.id === item.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedTop(item);
                      updateLiveVectorScore(item, selectedBottom, selectedOuter);
                    }}
                  >
                    <span
                      className="dot"
                      style={{ backgroundColor: item.colorHex || '#111827' }}
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. ALT GİYİM SLOTU */}
          <div className={`studio-slot ${selectedBottom ? 'is-filled' : ''}`}>
            <div className="slot-head">
              <span className="slot-role">
                <FiLayers /> {t('PAGE.WARDROBE.SLOT_BOTTOM')}
              </span>
              {selectedBottom && (
                <button
                  type="button"
                  className="slot-clear"
                  onClick={() => {
                    setSelectedBottom(undefined);
                    updateLiveVectorScore(selectedTop, undefined, selectedOuter);
                  }}
                  title="Slottan Çıkar"
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={selectedBottom?.id || ''}
              onChange={(e) => {
                const nextBottom = bottoms.find((x) => x.id === e.target.value);
                setSelectedBottom(nextBottom);
                updateLiveVectorScore(selectedTop, nextBottom, selectedOuter);
              }}
              className="slot-dropdown"
            >
              <option value="">
                {t('PAGE.WARDROBE.SELECT_FROM_WARDROBE')} ({bottoms.length})
              </option>
              {bottoms.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.color})
                </option>
              ))}
            </select>

            {selectedBottom ? (
              <div className="slot-card">
                <div className="slot-card__visual">
                  {selectedBottom.imageUrl ? (
                    <img src={selectedBottom.imageUrl} alt={selectedBottom.name} />
                  ) : (
                    <div
                      className="slot-swatch"
                      style={{
                        backgroundColor: selectedBottom.colorHex || '#1e3a8a',
                        color: ['#f9fafb', '#e2d5c3', '#ffffff'].includes(
                          selectedBottom.colorHex || ''
                        )
                          ? '#111827'
                          : '#ffffff',
                      }}
                    >
                      <FiLayers />
                    </div>
                  )}
                </div>
                <div className="slot-card__meta">
                  <span className="cat-tag">{selectedBottom.category}</span>
                  <h4>{selectedBottom.name}</h4>
                  <span className="color-tag">{selectedBottom.color}</span>
                </div>
              </div>
            ) : (
              <div className="slot-empty">
                <FiPlus className="empty-plus" />
                <span>{t('PAGE.WARDROBE.EMPTY_SLOT')}</span>
                <small>Yukarıdaki listeden veya aşağıdan hızlı seç</small>
              </div>
            )}

            {bottoms.length > 0 && (
              <div className="quick-pick-strip">
                {bottoms.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`quick-pill ${
                      selectedBottom?.id === item.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedBottom(item);
                      updateLiveVectorScore(selectedTop, item, selectedOuter);
                    }}
                  >
                    <span
                      className="dot"
                      style={{ backgroundColor: item.colorHex || '#1e3a8a' }}
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. DIŞ GİYİM SLOTU */}
          <div className={`studio-slot ${selectedOuter ? 'is-filled' : ''}`}>
            <div className="slot-head">
              <span className="slot-role">
                <FiShield /> {t('PAGE.WARDROBE.SLOT_OUTER')}
              </span>
              {selectedOuter && (
                <button
                  type="button"
                  className="slot-clear"
                  onClick={() => {
                    setSelectedOuter(undefined);
                    updateLiveVectorScore(selectedTop, selectedBottom, undefined);
                  }}
                  title="Slottan Çıkar"
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={selectedOuter?.id || ''}
              onChange={(e) => {
                const nextOuter = outers.find((x) => x.id === e.target.value);
                setSelectedOuter(nextOuter);
                updateLiveVectorScore(selectedTop, selectedBottom, nextOuter);
              }}
              className="slot-dropdown"
            >
              <option value="">
                {t('PAGE.WARDROBE.SELECT_FROM_WARDROBE')} ({outers.length})
              </option>
              {outers.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.color})
                </option>
              ))}
            </select>

            {selectedOuter ? (
              <div className="slot-card">
                <div className="slot-card__visual">
                  {selectedOuter.imageUrl ? (
                    <img src={selectedOuter.imageUrl} alt={selectedOuter.name} />
                  ) : (
                    <div
                      className="slot-swatch"
                      style={{
                        backgroundColor: selectedOuter.colorHex || '#111827',
                        color: ['#f9fafb', '#e2d5c3', '#ffffff'].includes(
                          selectedOuter.colorHex || ''
                        )
                          ? '#111827'
                          : '#ffffff',
                      }}
                    >
                      <FiShield />
                    </div>
                  )}
                </div>
                <div className="slot-card__meta">
                  <span className="cat-tag">{selectedOuter.category}</span>
                  <h4>{selectedOuter.name}</h4>
                  <span className="color-tag">{selectedOuter.color}</span>
                </div>
              </div>
            ) : (
              <div className="slot-empty">
                <FiPlus className="empty-plus" />
                <span>{t('PAGE.WARDROBE.EMPTY_SLOT')}</span>
                <small>İsteğe bağlı ceket / dış giyim katmanı</small>
              </div>
            )}

            {outers.length > 0 && (
              <div className="quick-pick-strip">
                {outers.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`quick-pill ${
                      selectedOuter?.id === item.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedOuter(item);
                      updateLiveVectorScore(selectedTop, selectedBottom, item);
                    }}
                  >
                    <span
                      className="dot"
                      style={{ backgroundColor: item.colorHex || '#111827' }}
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kombini Kaydet Barı */}
        {(selectedTop || selectedBottom || selectedOuter) && (
          <form className="studio-save-bar" onSubmit={handleSaveOutfit}>
            <input
              type="text"
              value={outfitTitle}
              onChange={(e) => setOutfitTitle(e.target.value)}
              placeholder={t('PAGE.WARDROBE.OUTFIT_NAME_PLACEHOLDER')}
              className="save-input"
            />
            <button type="submit" className="save-btn">
              <FiSave /> {t('PAGE.WARDROBE.BTN_SAVE_OUTFIT')}
            </button>
          </form>
        )}
      </section>

      {/* Qwen3-Embedding Mağazalardan Kombin Tamamlayıcı */}
      <section className="studio-store-matcher">
        <div className="matcher-header">
          <div>
            <h2>
              <FiCpu style={{ verticalAlign: 'middle', marginRight: '0.45rem' }} />
              Qwen3-Embedding — Kombini Mağazalardan Tamamla (Mavi, Bershka, LCW)
            </h2>
            <p>
              Tahtada seçtiğin kıyafetlerin (veya dolabının) kesim silüetine ve renk
              dengesine en uygun mağaza ürünlerini vektör uzayında bul:
            </p>
          </div>

          <div className="matcher-controls">
            <select
              value={storeRecCategory}
              onChange={(e) => {
                setStoreRecCategory(e.target.value);
                handleFetchStoreOutfitRecs(e.target.value);
              }}
              className="matcher-select"
            >
              <option value="auto">Otomatik (Eksik Slotu Tamamla)</option>
              <option value="tisort">Tişört Öner</option>
              <option value="jean">Jean / Pantolon Öner</option>
              <option value="gomlek">Gömlek Öner</option>
              <option value="sweatshirt">Sweatshirt Öner</option>
              <option value="ceket">Ceket Öner</option>
            </select>

            <button
              type="button"
              className="btn-fetch-matcher"
              onClick={() => handleFetchStoreOutfitRecs()}
              disabled={storeRecsLoading}
            >
              <FiShoppingBag />
              {storeRecsLoading
                ? 'Vektörler Hesaplanıyor...'
                : 'Mağazalardan Uyumlu Parça Bul'}
            </button>
          </div>
        </div>

        {storeRecs.length > 0 && (
          <div className="matcher-grid">
            {storeRecs.map((rec) => (
              <article key={rec.product.id} className="matcher-card">
                <div className="matcher-card__img">
                  <span className="score-badge">
                    %{rec.similarityScore} Vektör Uyumu
                  </span>
                  <span className="brand-badge">{rec.product.brand}</span>
                  <img
                    src={rec.product.imageUrl}
                    alt={rec.product.name}
                    loading="lazy"
                  />
                </div>
                <div className="matcher-card__body">
                  <h4>{rec.product.name}</h4>
                  <p>{rec.matchReason}</p>
                  {rec.product.offers?.[0] && (
                    <strong className="price">
                      {formatPrice(rec.product.offers[0].price)}
                    </strong>
                  )}
                  <div className="card-btns">
                    <button
                      type="button"
                      className="btn-apply"
                      onClick={() => handleApplyStoreItemToOutfit(rec.product)}
                    >
                      <FiPlus /> Tahtaya & Dolaba Ekle
                    </button>
                    <Link
                      to={`/product/${rec.product.id}`}
                      className="btn-detail"
                    >
                      Detay
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Kaydedilen Kombinlerim (Lookbook) */}
      {outfits.length > 0 && (
        <section className="studio-saved-section">
          <div className="saved-head">
            <h2>
              <FiFolder style={{ verticalAlign: 'middle', marginRight: '0.45rem' }} />
              {t('PAGE.WARDROBE.SAVED_OUTFITS_TITLE')} ({outfits.length})
            </h2>
          </div>

          <div className="saved-grid">
            {outfits.map((oft) => (
              <article key={oft.id} className="saved-look-card">
                <div className="saved-look-card__top">
                  <h3>{oft.title}</h3>
                  <div className="look-actions">
                    <button
                      type="button"
                      className="btn-load-look"
                      onClick={() => {
                        setSelectedTop(oft.top);
                        setSelectedBottom(oft.bottom);
                        setSelectedOuter(oft.outer);
                        updateLiveVectorScore(oft.top, oft.bottom, oft.outer);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Tahtaya Yükle
                    </button>
                    <button
                      type="button"
                      className="btn-delete-look"
                      onClick={() => removeOutfit(oft.id)}
                      title={t('PAGE.WARDROBE.REMOVE')}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="saved-look-card__pieces">
                  {oft.top && (
                    <div className="piece-chip">
                      <span
                        className="piece-dot"
                        style={{ backgroundColor: oft.top.colorHex || '#3b82f6' }}
                      />
                      <span>{oft.top.name}</span>
                    </div>
                  )}
                  {oft.bottom && (
                    <div className="piece-chip">
                      <span
                        className="piece-dot"
                        style={{ backgroundColor: oft.bottom.colorHex || '#1e3a8a' }}
                      />
                      <span>{oft.bottom.name}</span>
                    </div>
                  )}
                  {oft.outer && (
                    <div className="piece-chip">
                      <span
                        className="piece-dot"
                        style={{ backgroundColor: oft.outer.colorHex || '#111827' }}
                      />
                      <span>{oft.outer.name}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OutfitStudio;
