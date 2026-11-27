import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiX } from 'react-icons/fi';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchProducts, scrapeProductByUrl } from '../../services/api';
import { ClothingItem } from '../../types';
import {
  EmptyStateCard,
  ErrorStateCard,
  ProductCardSkeletonGrid,
} from '../../components/Feedback/Feedback';
import './Compare.scss';

const MAX_COMPARE = 3;

const QUICK_CATEGORIES = [
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.TSHIRT', query: 'tisort' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.JEAN', query: 'jean' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.SWEATSHIRT', query: 'sweatshirt' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.SHIRT', query: 'gomlek' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.JACKET', query: 'ceket' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

const keyOf = (p: ClothingItem) => `${p.brand}-${p.id}`;
const priceOf = (p: ClothingItem) => p.offers[0]?.price ?? Number.MAX_VALUE;

const Compare = () => {
  const { t } = useI18n();
  const [query, setQuery] = useState('tisort');
  const [candidates, setCandidates] = useState<ClothingItem[]>([]);
  const [selected, setSelected] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [adding, setAdding] = useState(false);

  const loadCandidates = (q: string) => {
    setLoading(true);
    setError(null);
    fetchProducts(q, 'all', 12)
      .then(setCandidates)
      .catch((e) => setError(e instanceof Error ? e.message : t('PAGE.PRODUCTS.ERROR_DEFAULT')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCandidates(query);
  }, [query]);

  const isSelected = (p: ClothingItem) => selected.some((s) => keyOf(s) === keyOf(p));

  const toggle = (p: ClothingItem) => {
    if (isSelected(p)) {
      setSelected((prev) => prev.filter((s) => keyOf(s) !== keyOf(p)));
    } else if (selected.length < MAX_COMPARE) {
      setSelected((prev) => [...prev, p]);
    }
  };

  const addByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || selected.length >= MAX_COMPARE) return;
    try {
      setAdding(true);
      setError(null);
      const item = await scrapeProductByUrl(urlInput.trim());
      setSelected((prev) => (prev.some((s) => keyOf(s) === keyOf(item)) ? prev : [...prev, item]));
      setUrlInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('PAGE.PRODUCTS.ERROR_SCRAPE'));
    } finally {
      setAdding(false);
    }
  };

  const cheapest = selected.length > 1 ? Math.min(...selected.map(priceOf)) : null;

  const rows: { labelKey: string; render: (p: ClothingItem) => React.ReactNode }[] = [
    { labelKey: 'PAGE.COMPARE.ROW.STORE', render: (p) => p.brand },
    { labelKey: 'PAGE.COMPARE.ROW.CATEGORY', render: (p) => p.category },
    { labelKey: 'PAGE.PRODUCT_DETAIL.SPEC.COLOR', render: (p) => p.color },
    { labelKey: 'PAGE.PRODUCT_DETAIL.SPEC.FIT', render: (p) => p.fit },
    { labelKey: 'PAGE.PRODUCT_DETAIL.SPEC.MATERIAL', render: (p) => p.material },
    { labelKey: 'PAGE.PRODUCT_DETAIL.AVAILABLE_SIZES', render: (p) => p.availableSizes?.join(', ') },
  ];

  return (
    <div className="compare-page">
      <header className="compare-header">
        <h1>{t('PAGE.COMPARE.HEADING')}</h1>
        <p>{t('PAGE.COMPARE.SUBTITLE')}</p>
      </header>

      <section className="compare-slots">
        {Array.from({ length: MAX_COMPARE }).map((_, i) => {
          const p = selected[i];
          return p ? (
            <div key={keyOf(p)} className="compare-slot compare-slot--filled">
              <button className="compare-slot__remove" onClick={() => toggle(p)} aria-label="remove">
                <FiX />
              </button>
              <img src={p.imageUrl} alt={p.name} />
              <small>{p.brand}</small>
              <h3>{p.name}</h3>
              <strong>{formatPrice(priceOf(p))}</strong>
            </div>
          ) : (
            <div key={i} className="compare-slot">
              <span><FiPlus /></span>
              <p>{t('PAGE.COMPARE.EMPTY_SLOT')}</p>
            </div>
          );
        })}
      </section>

      {selected.length >= 2 ? (
        <section className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th />
                {selected.map((p) => (
                  <th key={keyOf(p)}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('PAGE.PRODUCT_DETAIL.OFFICIAL_PRICE')}</td>
                {selected.map((p) => (
                  <td key={keyOf(p)} className={priceOf(p) === cheapest ? 'is-best' : ''}>
                    {formatPrice(priceOf(p))}
                    {priceOf(p) === cheapest && <span className="badge">{t('PAGE.COMPARE.CHEAPEST')}</span>}
                  </td>
                ))}
              </tr>
              {rows.map((r) => (
                <tr key={r.labelKey}>
                  <td>{t(r.labelKey)}</td>
                  {selected.map((p) => (
                    <td key={keyOf(p)}>{r.render(p) || '-'}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td />
                {selected.map((p) => (
                  <td key={keyOf(p)}>
                    <Link to={`/product/${p.id}`} className="compare-link">
                      {t('PAGE.PRODUCTS.BTN_DETAIL')}
                    </Link>
                    {p.offers[0]?.url && (
                      <a href={p.offers[0].url} target="_blank" rel="noreferrer" className="compare-link">
                        {t('PAGE.PRODUCTS.BTN_VIEW_STORE')}
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      ) : (
        <p className="compare-hint">{t('PAGE.COMPARE.HINT')}</p>
      )}

      <section className="compare-picker">
        <h2>{t('PAGE.COMPARE.PICKER_TITLE')}</h2>

        <form className="compare-url" onSubmit={addByUrl}>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('PAGE.COMPARE.URL_PLACEHOLDER')}
          />
          <button type="submit" disabled={adding || selected.length >= MAX_COMPARE}>
            {adding ? t('PAGE.PRODUCTS.SCRAPER_BTN_LOADING') : t('PAGE.COMPARE.ADD_BTN')}
          </button>
        </form>

        <div className="compare-chips">
          {QUICK_CATEGORIES.map((c) => (
            <button
              key={c.query}
              className={query === c.query ? 'active' : ''}
              onClick={() => setQuery(c.query)}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>

        {loading ? (
          <ProductCardSkeletonGrid count={6} compact />
        ) : error ? (
          <ErrorStateCard message={error} onRetry={() => loadCandidates(query)} />
        ) : candidates.length === 0 ? (
          <EmptyStateCard
            title={t('STATE.EMPTY.PRODUCTS_TITLE')}
            description={t('STATE.EMPTY.PRODUCTS_DESC')}
          />
        ) : (
          <div className="compare-grid">
            {candidates.map((p) => (
              <button
                key={keyOf(p)}
                className={`compare-card ${isSelected(p) ? 'selected' : ''}`}
                onClick={() => toggle(p)}
                disabled={!isSelected(p) && selected.length >= MAX_COMPARE}
              >
                <img src={p.imageUrl} alt={p.name} loading="lazy" />
                <small>{p.brand}</small>
                <span>{p.name}</span>
                <strong>{formatPrice(priceOf(p))}</strong>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Compare;
