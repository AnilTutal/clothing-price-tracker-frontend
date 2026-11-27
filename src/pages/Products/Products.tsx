import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiLayers,
  FiPercent,
  FiRotateCcw,
  FiSearch,
  FiShoppingBag,
  FiSliders,
  FiTag,
  FiX,
} from 'react-icons/fi';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchProducts /*, scrapeProductByUrl */ } from '../../services/api'; // [LINKLE ÜRÜN ÇEKME KAPALI] scrapeProductByUrl yorumda
import { ClothingItem } from '../../types';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import {
  EmptyStateCard,
  ErrorStateCard,
  ProductCardSkeletonGrid,
} from '../../components/Feedback/Feedback';
import './Products.scss';

// [LINKLE ÜRÜN ÇEKME KAPALI] Hazır örnek linkler (1/5)
/*
const SAMPLE_STORE_URLS = [
  {
    label: 'Mavi - Marcus 90lar Jean (00351A4072)',
    url: 'https://www.mavi.com/marcus-90lar-classic-indigo-mavisi-jean-pantolon/p/00351A4072',
  },
  {
    label: 'Bershka - Baggy Fit Jean (c0p226931502)',
    url: 'https://www.bershka.com/tr/baggy-fit-jean-c0p226931502.html',
  },
  {
    label: 'Mavi - Ekru Tişört (0613510-70057)',
    url: 'https://www.mavi.com/ekru-tisort/p/0613510-70057',
  },
  {
    label: 'Bershka - Boxy Fit Tişört (c0p235319922)',
    url: 'https://www.bershka.com/tr/baskılı-boxy-fit-kısa-kollu-tişört-c0p235319922.html',
  },
];
*/

// Mağaza başına gösterilecek toplam ürün sayısı (API'ye pageSize olarak gider)
const PAGE_SIZE = 60;
// Her sayfada gösterilecek maksimum ürün sayısı (Sayfalama / Pagination)
const ITEMS_PER_PAGE = 30;

const STORE_FILTERS = [
  { labelKey: 'PAGE.PRODUCTS.STORE.ALL', value: 'all' },
  { label: 'Mavi', value: 'Mavi' },
  { label: 'Bershka', value: 'Bershka' },
  { label: 'LC Waikiki', value: 'LC Waikiki' },
];

const QUICK_CATEGORIES = [
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.ALL', query: 'all' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.TSHIRT', query: 'tisort' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.JEAN', query: 'jean' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.SWEATSHIRT', query: 'sweatshirt' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.SHIRT', query: 'gomlek' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.JACKET', query: 'ceket' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);

const Products = () => {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeQuery, setActiveQuery] = useState<string>(
    () => searchParams.get('cat') || 'all'
  );
  const [activeStore, setActiveStore] = useState<string>(
    () => searchParams.get('store') || 'all'
  );

  // Üst menüdeki "Mağazalar" açılır menüsünden bir mağaza seçildiğinde URL parametrelerini state'e senkronla
  useEffect(() => {
    const storeParam = searchParams.get('store');
    const catParam = searchParams.get('cat');
    if (storeParam && storeParam !== activeStore) {
      setActiveStore(storeParam);
    }
    if (catParam && catParam !== activeQuery) {
      setActiveQuery(catParam);
    }
  }, [searchParams]);

  // Arama, Sıralama ve Filtreleme State'leri (Veritabanı gerektirmeden bellek üzerinde anlık çalışır + mağaza aramasını tetikler)
  const [searchText, setSearchText] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'default' | 'price-asc' | 'price-desc' | 'discount-desc'
  >('default');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // [LINKLE ÜRÜN ÇEKME KAPALI] State'ler (2/5)
  /*
  const [urlInput, setUrlInput] = useState<string>(SAMPLE_STORE_URLS[0].url);
  const [scraping, setScraping] = useState<boolean>(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  */
  const highlightedId = null as string | null; // linkle çekme açılırsa yukarıdaki state kullanılır

  const loadProducts = async (query: string, store: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(query, store, PAGE_SIZE);
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('PAGE.PRODUCTS.ERROR_DEFAULT')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(activeQuery, activeStore);
  }, [activeQuery, activeStore]);

  // Mevcut ürün listesinden dinamik Renk ve Beden seçeneklerini çıkar
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.color && p.color.trim()) {
        set.add(p.color.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [products]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.availableSizes?.forEach((sz) => {
        if (sz && sz.trim()) {
          set.add(sz.trim());
        }
      });
    });
    return Array.from(set);
  }, [products]);

  // Anlık filtreleme ve sıralama (In-Memory)
  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLocaleLowerCase('tr-TR');
    const min = minPrice.trim() !== '' ? Number(minPrice) : null;
    const max = maxPrice.trim() !== '' ? Number(maxPrice) : null;

    const list = products.filter((item) => {
      const offer = item.offers[0];
      const price = offer?.price ?? 0;

      // 1. Serbest metin filtresi (ad, renk, kategori, kalıp, marka, ürün kodu)
      if (keyword) {
        const haystack = [
          item.name,
          item.color,
          item.category,
          item.fit,
          item.brand,
          item.id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('tr-TR');

        if (!haystack.includes(keyword)) {
          return false;
        }
      }

      // 2. Renk filtresi
      if (selectedColor !== 'all' && item.color !== selectedColor) {
        return false;
      }

      // 3. Beden filtresi
      if (
        selectedSize !== 'all' &&
        (!item.availableSizes || !item.availableSizes.includes(selectedSize))
      ) {
        return false;
      }

      // 4. Fiyat aralığı filtresi
      if (min !== null && !Number.isNaN(min) && price < min) {
        return false;
      }
      if (max !== null && !Number.isNaN(max) && price > max) {
        return false;
      }

      // 5. Sadece indirimdekiler
      if (onlyDiscounted && !(offer?.discountRate && offer.discountRate > 0)) {
        return false;
      }

      return true;
    });

    // 6. Sıralama
    if (sortBy === 'price-asc') {
      return [...list].sort(
        (a, b) => (a.offers[0]?.price ?? 0) - (b.offers[0]?.price ?? 0)
      );
    }
    if (sortBy === 'price-desc') {
      return [...list].sort(
        (a, b) => (b.offers[0]?.price ?? 0) - (a.offers[0]?.price ?? 0)
      );
    }
    if (sortBy === 'discount-desc') {
      return [...list].sort(
        (a, b) =>
          (b.offers[0]?.discountRate ?? 0) - (a.offers[0]?.discountRate ?? 0)
      );
    }

    return list;
  }, [
    products,
    searchText,
    selectedColor,
    selectedSize,
    minPrice,
    maxPrice,
    onlyDiscounted,
    sortBy,
  ]);

  const hasActiveFilters =
    searchText.trim() !== '' ||
    sortBy !== 'default' ||
    selectedColor !== 'all' ||
    selectedSize !== 'all' ||
    minPrice.trim() !== '' ||
    maxPrice.trim() !== '' ||
    onlyDiscounted;

  // Filtre, mağaza veya kategori değiştiğinde 1. sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeQuery,
    activeStore,
    searchText,
    sortBy,
    selectedColor,
    selectedSize,
    minPrice,
    maxPrice,
    onlyDiscounted,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchText('');
    setSortBy('default');
    setSelectedColor('all');
    setSelectedSize('all');
    setMinPrice('');
    setMaxPrice('');
    setOnlyDiscounted(false);
  };

  const handleStoreSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    // Seçili rengi/bedeni sıfırlayıp mağazalardan canlı arama yap
    setSelectedColor('all');
    setSelectedSize('all');
    setSearchText('');
    setActiveQuery(q);
  };

  // [LINKLE ÜRÜN ÇEKME KAPALI] Link gönderme fonksiyonu (3/5)
  /*
  const handleFetchSingleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      setScraping(true);
      setScrapeMessage(null);
      setError(null);
      const item = await scrapeProductByUrl(urlInput.trim());

      setProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== item.id);
        return [item, ...filtered];
      });
      setHighlightedId(item.id);
      setScrapeMessage(
        `"${item.name}" (${item.id}) — ${item.brand} ${t('PAGE.PRODUCTS.SCRAPE_SUCCESS')}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('PAGE.PRODUCTS.ERROR_SCRAPE'));
    } finally {
      setScraping(false);
    }
  };
  */

  return (
    <div className="products-page">
      
      {/* [LINKLE ÜRÜN ÇEKME KAPALI] Ortak Ürün Çekme Kutusu (Mavi & Bershka) (4/5)
      <section className="scraper-card">
        <div className="scraper-card__title">
          <span className="badge-live">{t('PAGE.PRODUCTS.BADGE_LIVE')}</span>
          <h2>{t('PAGE.PRODUCTS.SCRAPER_TITLE')}</h2>
        </div>
        <form className="scraper-form" onSubmit={handleFetchSingleUrl}>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('PAGE.PRODUCTS.SCRAPER_PLACEHOLDER')}
            className="scraper-input"
          />
          <button type="submit" className="scraper-btn" disabled={scraping}>
            {scraping ? t('PAGE.PRODUCTS.SCRAPER_BTN_LOADING') : t('PAGE.PRODUCTS.SCRAPER_BTN')}
          </button>
        </form>

        <div className="sample-links">
          <span>{t('PAGE.PRODUCTS.SAMPLE_LINKS')}</span>
          {SAMPLE_STORE_URLS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              className="sample-chip"
              onClick={() => setUrlInput(sample.url)}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {scrapeMessage && <div className="scrape-success">{scrapeMessage}</div>}
      </section>
      */}

      {/* Modern Arama, Mağaza/Kategori ve Akıllı Filtre Stüdyosu */}
      <section className="modern-search-hub">
        {/* 1. Mağaza ve Kategori Sekmeleri */}
        <div className="hub-top-bars">
          <div className="store-segmented">
            {STORE_FILTERS.map((store) => (
              <button
                key={store.value}
                type="button"
                className={`store-seg-btn ${activeStore === store.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedColor('all');
                  setSelectedSize('all');
                  setActiveStore(store.value);
                  setActiveQuery('all');
                  setSearchParams({ store: store.value, cat: 'all' });
                }}
              >
                <span className={`store-dot store-dot--${store.value.toLowerCase().replace(/\s+/g, '-')}`} />
                {store.labelKey ? t(store.labelKey) : store.label}
              </button>
            ))}
          </div>

          <div className="category-pills-row">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.query}
                type="button"
                className={`cat-pill-btn ${activeQuery === cat.query ? 'active' : ''}`}
                onClick={() => {
                  setSelectedColor('all');
                  setSelectedSize('all');
                  setActiveQuery(cat.query);
                  setSearchParams({ store: activeStore, cat: cat.query });
                }}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Büyük Komut Arama Çubuğu (Command Search Bar) + Hızlı Arama Etiketleri */}
        <div className="command-search-area">
          <form className="command-search-form" onSubmit={handleStoreSearch}>
            <div className="command-input-box">
              <span className="cmd-search-icon" aria-hidden="true">
                <FiSearch />
              </span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t('PAGE.PRODUCTS.SEARCH_PLACEHOLDER')}
                className="cmd-search-input"
              />
              {searchText && (
                <button
                  type="button"
                  className="cmd-clear-btn"
                  onClick={() => setSearchText('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
              <button
                type="submit"
                className="cmd-submit-btn"
                disabled={!searchText.trim() || loading}
              >
                <FiSearch /> {t('PAGE.PRODUCTS.SEARCH_STORE_BTN')}
              </button>
            </div>
          </form>

          <div className="quick-search-tags">
            <span className="tags-label">Popüler Aramalar:</span>
            {['Oversize', 'Baggy', 'Siyah', 'Beyaz', 'Denim', 'Pamuk'].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`quick-tag-chip ${
                  searchText.toLowerCase() === tag.toLowerCase() ? 'active' : ''
                }`}
                onClick={() =>
                  setSearchText((prev) =>
                    prev.toLowerCase() === tag.toLowerCase() ? '' : tag
                  )
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Akıllı Filtre Kartları Şeridi */}
        <div className="smart-filter-row">
          {/* Fiyata / İndirime Göre Sıralama */}
          <div className="smart-filter-card">
            <label htmlFor="sort-select">
              <FiSliders /> {t('PAGE.PRODUCTS.SORT_LABEL')}
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'default'
                    | 'price-asc'
                    | 'price-desc'
                    | 'discount-desc'
                )
              }
            >
              <option value="default">{t('PAGE.PRODUCTS.SORT_DEFAULT')}</option>
              <option value="price-asc">
                {t('PAGE.PRODUCTS.SORT_PRICE_ASC')}
              </option>
              <option value="price-desc">
                {t('PAGE.PRODUCTS.SORT_PRICE_DESC')}
              </option>
              <option value="discount-desc">
                {t('PAGE.PRODUCTS.SORT_DISCOUNT')}
              </option>
            </select>
          </div>

          {/* Renk Filtresi */}
          <div className="smart-filter-card">
            <label htmlFor="color-select">
              <FiTag /> {t('PAGE.PRODUCTS.FILTER_COLOR')}
            </label>
            <select
              id="color-select"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="all">{t('PAGE.PRODUCTS.FILTER_ALL_COLORS')}</option>
              {availableColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Beden Filtresi */}
          <div className="smart-filter-card">
            <label htmlFor="size-select">
              <FiLayers /> {t('PAGE.PRODUCTS.FILTER_SIZE')}
            </label>
            <select
              id="size-select"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="all">{t('PAGE.PRODUCTS.FILTER_ALL_SIZES')}</option>
              {availableSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Fiyat Aralığı (Min - Maks ₺) */}
          <div className="smart-filter-card smart-filter-card--price">
            <label>₺ {t('PAGE.PRODUCTS.FILTER_PRICE_RANGE')}</label>
            <div className="price-inputs-pill">
              <input
                type="number"
                min="0"
                placeholder={t('PAGE.PRODUCTS.FILTER_MIN_PRICE')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="sep">—</span>
              <input
                type="number"
                min="0"
                placeholder={t('PAGE.PRODUCTS.FILTER_MAX_PRICE')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Sadece İndirimdekiler Modern Toggle Butonu */}
          <button
            type="button"
            className={`discount-toggle-pill ${onlyDiscounted ? 'active' : ''}`}
            onClick={() => setOnlyDiscounted((prev) => !prev)}
            aria-pressed={onlyDiscounted}
          >
            <FiPercent />
            <span>{t('PAGE.PRODUCTS.FILTER_ONLY_DISCOUNT')}</span>
          </button>
        </div>

        {/* 4. Aktif Filtre Etiketleri, Sonuç Sayısı ve Sıfırlama */}
        <div className="hub-footer-bar">
          <div className="results-and-chips">
            <span className="results-counter">
              <strong>
                {filteredProducts.length > 0
                  ? `${startIndex + 1}–${Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      filteredProducts.length
                    )}`
                  : 0}
              </strong>{' '}
              / <strong>{filteredProducts.length}</strong>{' '}
              {t('PAGE.PRODUCTS.RESULTS_SHOWING')}
            </span>

            {totalPages > 1 && (
              <span className="page-indicator-pill">
                Sayfa {safePage} / {totalPages}
              </span>
            )}

            {!QUICK_CATEGORIES.some((c) => c.query === activeQuery) && (
              <span className="active-chip">
                Mağaza Sorgusu: “{activeQuery}”
              </span>
            )}

            {selectedColor !== 'all' && (
              <button
                type="button"
                className="active-chip active-chip--removable"
                onClick={() => setSelectedColor('all')}
              >
                Renk: {selectedColor} <FiX />
              </button>
            )}

            {selectedSize !== 'all' && (
              <button
                type="button"
                className="active-chip active-chip--removable"
                onClick={() => setSelectedSize('all')}
              >
                Beden: {selectedSize} <FiX />
              </button>
            )}

            {(minPrice || maxPrice) && (
              <button
                type="button"
                className="active-chip active-chip--removable"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                Fiyat: {minPrice || '0'} ₺ – {maxPrice || '∞'} ₺ <FiX />
              </button>
            )}

            {onlyDiscounted && (
              <button
                type="button"
                className="active-chip active-chip--removable"
                onClick={() => setOnlyDiscounted(false)}
              >
                İndirimli <FiX />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="reset-all-btn"
              onClick={resetFilters}
            >
              <FiRotateCcw /> {t('PAGE.PRODUCTS.FILTER_RESET')}
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <ProductCardSkeletonGrid count={8} />
      ) : error ? (
        <ErrorStateCard
          message={error}
          onRetry={() => loadProducts(activeQuery, activeStore)}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyStateCard
          title={t('STATE.EMPTY.PRODUCTS_TITLE')}
          description={t('STATE.EMPTY.PRODUCTS_DESC')}
          actionLabel={
            hasActiveFilters ? t('PAGE.PRODUCTS.FILTER_RESET') : undefined
          }
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <>
          <div className="products-grid">
            {paginatedProducts.map((item) => {
            const offer = item.offers[0];
            const isHighlighted = item.id === highlightedId;

            return (
              <article
                key={item.id}
                className={`product-card ${isHighlighted ? 'product-card--highlighted' : ''}`}
              >
                <div className="product-card__image-wrap">
                  <FavoriteButton item={item} className="fav-btn--overlay" />                  {offer?.discountRate ? (
                    <span className="discount-badge">
                      %{offer.discountRate} {t('PAGE.PRODUCTS.DISCOUNT')}
                    </span>
                  ) : null}
                  <span
                    className={`brand-badge brand-badge--${item.brand.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.brand}
                  </span>
                  <img src={item.imageUrl} alt={item.name} loading="lazy" />
                </div>

                <div className="product-card__body">
                  <div className="product-card__meta">
                    <span>{item.category}</span>
                    {item.color && <span>• {item.color}</span>}
                    <span className="product-code">#{item.id}</span>
                  </div>

                  <h3 className="product-card__title">{item.name}</h3>

                  {item.fit && <p className="product-card__fit">{item.fit}</p>}

                  {item.availableSizes && item.availableSizes.length > 0 && (
                    <div className="product-card__sizes">
                      {item.availableSizes.map((size) => (
                        <span key={size} className="size-pill">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="product-card__price-row">
                    <div className="prices">
                      {offer?.originalPrice && (
                        <span className="old-price">{formatPrice(offer.originalPrice)}</span>
                      )}
                      {offer && <span className="current-price">{formatPrice(offer.price)}</span>}
                    </div>
                  </div>

                  <div className="product-card__actions">
                    <Link to={`/product/${item.id}`} className="btn-secondary">
                      {t('PAGE.PRODUCTS.BTN_DETAIL')}
                    </Link>
                    {offer?.url && (
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        {t('PAGE.PRODUCTS.BTN_VIEW_STORE')}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          </div>

          {/* Sayfalama (Pagination — Sayfa başına 30 ürün) */}
          {totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Pagination">
              <button
                type="button"
                className="page-btn page-btn--nav"
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage <= 1}
              >
                <FiArrowLeft style={{ verticalAlign: 'middle' }} /> Önceki
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-btn ${
                        pageNum === safePage ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="page-btn page-btn--nav"
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage >= totalPages}
              >
                Sonraki <FiArrowRight style={{ verticalAlign: 'middle' }} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default Products;

