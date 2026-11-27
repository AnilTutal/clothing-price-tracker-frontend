import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowDown, FiCheck, FiCpu } from 'react-icons/fi';
import { FaMagic, FaTshirt } from 'react-icons/fa';
import { useI18n } from '../../i18n/I18nProvider';
import {
  fetchPriceHistory,
  fetchProductById,
  fetchProductRecommendations,
  PricePoint,
} from '../../services/api';
import PriceChart from '../../components/PriceChart/PriceChart';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import { useWardrobe } from '../../services/wardrobe';
import { findMatchingWardrobeItems } from '../../services/outfitMatcher';
import { ErrorStateCard, ProductDetailSkeleton } from '../../components/Feedback/Feedback';
import { setLastViewedProduct } from '../../services/lastViewed';
import { ClothingItem, ProductRecommendationsResponse } from '../../types';
import './ProductDetail.scss';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);

const ProductDetail = () => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ClothingItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [recommendations, setRecommendations] =
    useState<ProductRecommendationsResponse | null>(null);
  const [recsLoading, setRecsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { items: wardrobeItems, isProductInWardrobe, toggleStoreItem } = useWardrobe();

  // Dolaptaki kıyafetlerden bu ürüne en çok yakışanları bul
  const matchingWardrobeItems = product
    ? findMatchingWardrobeItems(product, wardrobeItems, 3)
    : [];

  const loadDetail = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);
      setRecommendations(null);
      const data = await fetchProductById(targetId);
      setProduct(data);
      setSelectedImage(data.imageUrl);
      setLastViewedProduct({ id: data.id, name: data.name });
      // Fiyat geçmişi (ürün kaydedildikten sonra çekilir; hata grafiği gizler, sayfayı bozmaz)
      fetchPriceHistory(data.id, 30).then(setHistory).catch(() => setHistory([]));

      // Qwen3-Embedding + Cosine Similarity önerilerini arka planda çek
      setRecsLoading(true);
      fetchProductRecommendations(data.id)
        .then(setRecommendations)
        .catch(() => setRecommendations(null))
        .finally(() => setRecsLoading(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('PAGE.PRODUCT_DETAIL.ERROR_LOAD'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadDetail(id);
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <Link to="/products" className="back-link">
          {t('PAGE.PRODUCT_DETAIL.BACK_TO_PRODUCTS')}
        </Link>
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Link to="/products" className="back-link">
          {t('PAGE.PRODUCT_DETAIL.BACK_TO_PRODUCTS')}
        </Link>
        <ErrorStateCard
          message={error || t('PAGE.PRODUCT_DETAIL.NOT_FOUND')}
          onRetry={id ? () => loadDetail(id) : undefined}
        />
      </div>
    );
  }

  const offer = product.offers[0];
  const images =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [product.imageUrl];

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">
        {t('PAGE.PRODUCT_DETAIL.BACK_TO_PRODUCTS')}
      </Link>

      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="main-image-box">
            <img src={selectedImage || product.imageUrl} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.slice(0, 6).map((imgUrl) => (
                <button
                  key={imgUrl}
                  type="button"
                  className={`thumb-btn ${selectedImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img src={imgUrl} alt={product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <div className="brand-row">
            <span className="brand-pill">{product.brand}</span>
            <FavoriteButton item={product} />
            <button
              type="button"
              className={`wardrobe-toggle-btn ${isProductInWardrobe(product.id) ? 'in-wardrobe' : ''}`}
              onClick={() => toggleStoreItem(product)}
              title={isProductInWardrobe(product.id) ? t('PAGE.WARDROBE.ALREADY_IN') : t('PAGE.WARDROBE.ADD_TO_WARDROBE')}
            >
              {isProductInWardrobe(product.id) ? (
                <>
                  <FiCheck style={{ verticalAlign: 'middle' }} /> {t('PAGE.WARDROBE.IN_MY_WARDROBE')}
                </>
              ) : (
                <>
                  <FaTshirt style={{ verticalAlign: 'middle' }} /> {t('PAGE.WARDROBE.ADD_TO_WARDROBE')}
                </>
              )}
            </button>
            <span className="category-text">{product.category}</span>
            <span className="code-text">
              {t('PAGE.PRODUCT_DETAIL.CODE')} {product.id}
            </span>
          </div>

          <h1>{product.name}</h1>

          {product.description && <p className="description">{product.description}</p>}

          <div className="specs-grid">
            {product.color && (
              <div className="spec-item">
                <span className="spec-label">{t('PAGE.PRODUCT_DETAIL.SPEC.COLOR')}</span>
                <span className="spec-val">{product.color}</span>
              </div>
            )}
            {product.fit && (
              <div className="spec-item">
                <span className="spec-label">{t('PAGE.PRODUCT_DETAIL.SPEC.FIT')}</span>
                <span className="spec-val">{product.fit}</span>
              </div>
            )}
            {product.material && (
              <div className="spec-item">
                <span className="spec-label">{t('PAGE.PRODUCT_DETAIL.SPEC.MATERIAL')}</span>
                <span className="spec-val">{product.material}</span>
              </div>
            )}
          </div>

          {product.availableSizes && product.availableSizes.length > 0 && (
            <div className="sizes-section">
              <h3>{t('PAGE.PRODUCT_DETAIL.AVAILABLE_SIZES')}</h3>
              <div className="sizes-list">
                {product.availableSizes.map((s) => (
                  <span key={s} className="size-box">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {offer && (
            <div className="offer-box">
              <div className="offer-box__store">
                <strong>{offer.storeName}</strong> {t('PAGE.PRODUCT_DETAIL.OFFICIAL_PRICE')}
                {offer.discountRate ? (
                  <span className="discount-tag">
                    %{offer.discountRate} {t('PAGE.PRODUCT_DETAIL.DISCOUNT')}
                  </span>
                ) : null}
              </div>

              <div className="offer-box__prices">
                {offer.originalPrice && (
                  <span className="old-price">{formatPrice(offer.originalPrice)}</span>
                )}
                <span className="current-price">{formatPrice(offer.price)}</span>
              </div>

              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="go-store-btn"
              >
                {t('PAGE.PRODUCT_DETAIL.GO_STORE_BTN')}
              </a>
            </div>
          )}

          {/* Dolaptan Bu Ürünle Uyumlu Parçalar (Renk Teorisi Algoritması) */}
          {matchingWardrobeItems.length > 0 && (
            <div className="wardrobe-match-box">
              <div className="match-head">
                <h3>
                  <FaTshirt style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                  {t('PAGE.PRODUCT_DETAIL.WARDROBE_MATCH_TITLE')}
                </h3>
                <span className="badge-match">{t('PAGE.PRODUCT_DETAIL.COLOR_HARMONY')}</span>
              </div>
              <p className="match-sub">{t('PAGE.PRODUCT_DETAIL.WARDROBE_MATCH_SUB')}</p>
              <div className="match-items-grid">
                {matchingWardrobeItems.map(({ item, matchScore, reason }) => (
                  <div key={item.id} className="match-item-card">
                    <div className="item-thumb">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div
                          className="thumb-color"
                          style={{ backgroundColor: item.colorHex || '#111827' }}
                        />
                      )}
                    </div>
                    <div className="item-text">
                      <strong>{item.name}</strong>
                      <div className="score-pill">%{matchScore} {t('PAGE.PRODUCT_DETAIL.MATCH')}</div>
                      <small>{reason}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="history-box">
            <h3>{t('PAGE.PRODUCT_DETAIL.PRICE_HISTORY')}</h3>
            {history.length > 1 ? (
              <PriceChart points={history} />
            ) : (
              <p className="history-empty">{t('PAGE.PRODUCT_DETAIL.PRICE_HISTORY_EMPTY')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Qwen3-Embedding + Cosine Similarity Yapay Zeka Öneri Bölümü */}
      {recsLoading && (
        <div className="ai-recs-loading">{t('PAGE.PRODUCT_DETAIL.AI_LOADING')}</div>
      )}

      {recommendations && (
        <div className="ai-recommendations-wrap">
          {/* 1) Diğer Mağazalardaki En Benzer Alternatifler */}
          {recommendations.similarProducts.length > 0 && (
            <section className="ai-rec-section">
              <div className="ai-rec-header">
                <div>
                  <h2>
                    <FiCpu style={{ verticalAlign: 'middle', marginRight: '0.45rem' }} />
                    {t('PAGE.PRODUCT_DETAIL.AI_SIMILAR_TITLE')}
                  </h2>
                  <p>{t('PAGE.PRODUCT_DETAIL.AI_SIMILAR_SUB')}</p>
                </div>
                <div className="ai-engine-badges">
                  <span className="engine-pill">{recommendations.engineName}</span>
                  <span className="dim-pill">{recommendations.vectorDimensions}D Cosine</span>
                </div>
              </div>

              <div className="ai-rec-grid">
                {recommendations.similarProducts.map((rec) => {
                  const recOffer = rec.product.offers[0];
                  const isCheaper = rec.priceDifference < -1;
                  const isMoreExpensive = rec.priceDifference > 1;

                  return (
                    <Link
                      to={`/product/${rec.product.id}`}
                      key={rec.product.id}
                      className="ai-rec-card"
                    >
                      <div className="ai-rec-card__img">
                        <span className="ai-score-badge">
                          %{rec.similarityScore} {t('PAGE.PRODUCT_DETAIL.AI_VECTOR_MATCH')}
                        </span>
                        <span className="ai-brand-badge">{rec.product.brand}</span>
                        <img
                          src={rec.product.imageUrl}
                          alt={rec.product.name}
                          loading="lazy"
                        />
                      </div>

                      <div className="ai-rec-card__body">
                        <h4>{rec.product.name}</h4>
                        <p className="ai-reason">{rec.matchReason}</p>
                        <div className="ai-price-row">
                          {recOffer && (
                            <span className="ai-price">{formatPrice(recOffer.price)}</span>
                          )}
                          {isCheaper && (
                            <span className="price-diff-tag price-diff-tag--cheaper">
                              <FiArrowDown style={{ verticalAlign: 'middle' }} />{' '}
                              {formatPrice(Math.abs(rec.priceDifference))}{' '}
                              {t('PAGE.PRODUCT_DETAIL.AI_CHEAPER')}
                            </span>
                          )}
                          {isMoreExpensive && (
                            <span className="price-diff-tag price-diff-tag--higher">
                              +{formatPrice(rec.priceDifference)}
                            </span>
                          )}
                          {!isCheaper && !isMoreExpensive && (
                            <span className="price-diff-tag">
                              {t('PAGE.PRODUCT_DETAIL.AI_SAME_PRICE')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2) Stil & Kesim Uyumlu Tamamlayıcı Kombin Parçaları */}
          {recommendations.complementaryProducts.length > 0 && (
            <section className="ai-rec-section ai-rec-section--outfit">
              <div className="ai-rec-header">
                <div>
                  <h2>
                    <FaMagic style={{ verticalAlign: 'middle', marginRight: '0.45rem' }} />
                    {t('PAGE.PRODUCT_DETAIL.AI_COMPLEMENTARY_TITLE')}
                  </h2>
                  <p>{t('PAGE.PRODUCT_DETAIL.AI_COMPLEMENTARY_SUB')}</p>
                </div>
                <div className="ai-engine-badges">
                  <span className="engine-pill engine-pill--outfit">
                    Instruction-Aware Retrieval
                  </span>
                </div>
              </div>

              <div className="ai-rec-grid">
                {recommendations.complementaryProducts.map((rec) => {
                  const recOffer = rec.product.offers[0];
                  return (
                    <Link
                      to={`/product/${rec.product.id}`}
                      key={rec.product.id}
                      className="ai-rec-card"
                    >
                      <div className="ai-rec-card__img">
                        <span className="ai-score-badge ai-score-badge--outfit">
                          %{rec.similarityScore} {t('PAGE.PRODUCT_DETAIL.MATCH')}
                        </span>
                        <span className="ai-brand-badge">{rec.product.brand}</span>
                        <img
                          src={rec.product.imageUrl}
                          alt={rec.product.name}
                          loading="lazy"
                        />
                      </div>

                      <div className="ai-rec-card__body">
                        <h4>{rec.product.name}</h4>
                        <p className="ai-reason">{rec.matchReason}</p>
                        <div className="ai-price-row">
                          {recOffer && (
                            <span className="ai-price">{formatPrice(recOffer.price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

