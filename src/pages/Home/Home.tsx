import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiLayers, FiShield, FiShoppingBag } from 'react-icons/fi';
import { FaTshirt, FaUserTie } from 'react-icons/fa';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchProducts } from '../../services/api';
import { ClothingItem } from '../../types';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import {
  ErrorStateCard,
  ProductCardSkeletonGrid,
} from '../../components/Feedback/Feedback';
import './Home.scss';

const CATEGORIES: Array<{ labelKey: string; icon: ReactNode; query: string }> = [
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.TSHIRT', icon: <FaTshirt />, query: 'tisort' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.JEAN', icon: <FiLayers />, query: 'jean' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.SWEATSHIRT', icon: <FiShoppingBag />, query: 'sweatshirt' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.SHIRT', icon: <FaUserTie />, query: 'gomlek' },
  { labelKey: 'PAGE.PRODUCTS.CATEGORY.JACKET', icon: <FiShield />, query: 'ceket' },
];

const STORES = [
  { name: 'Mavi', color: '#1e3a8a', url: 'mavi.com' },
  { name: 'Bershka', color: '#111827', url: 'bershka.com/tr' },
  { name: 'LC Waikiki', color: '#0047ba', url: 'lcw.com' },
];

const STEPS = [
  { n: 1, titleKey: 'PAGE.HOME.HOW_1_TITLE', textKey: 'PAGE.HOME.HOW_1_TEXT' },
  { n: 2, titleKey: 'PAGE.HOME.HOW_2_TITLE', textKey: 'PAGE.HOME.HOW_2_TEXT' },
  { n: 3, titleKey: 'PAGE.HOME.HOW_3_TITLE', textKey: 'PAGE.HOME.HOW_3_TEXT' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

const Home = () => {
  const { t } = useI18n();
  const [featured, setFeatured] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadFeatured = () => {
    setLoading(true);
    setError(false);
    fetchProducts('tisort', 'all', 4)
      .then((data) => setFeatured(data.slice(0, 4)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <span className="home-hero__badge">{t('PAGE.HOME.HERO_BADGE')}</span>
        <h1>{t('PAGE.HOME.HERO_TITLE')}</h1>
        <p>{t('PAGE.HOME.HERO_SUBTITLE')}</p>
        <div className="home-hero__actions">
          <Link to="/products" className="btn btn--primary">
            {t('PAGE.HOME.HERO_CTA_PRIMARY')}
          </Link>
          <Link to="/compare" className="btn btn--ghost">
            {t('PAGE.HOME.HERO_CTA_SECONDARY')}
          </Link>
        </div>
        <div className="home-hero__stats">
          <div>
            <strong>{STORES.length}</strong>
            <span>{t('PAGE.HOME.STAT_STORES')}</span>
          </div>
          <div>
            <strong>{CATEGORIES.length}</strong>
            <span>{t('PAGE.HOME.STAT_CATEGORIES')}</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>{t('PAGE.HOME.STAT_LIVE')}</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>{t('PAGE.HOME.CATEGORIES_TITLE')}</h2>
        <div className="home-categories">
          {CATEGORIES.map((c) => (
            <Link
              to={`/products?cat=${c.query}`}
              key={c.labelKey}
              className="home-category"
            >
              <span className="home-category__icon">{c.icon}</span>
              <span>{t(c.labelKey)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__head">
          <h2>{t('PAGE.HOME.FEATURED_TITLE')}</h2>
          <Link to="/products">{t('PAGE.HOME.FEATURED_ALL')}</Link>
        </div>
        {loading ? (
          <ProductCardSkeletonGrid count={4} compact />
        ) : error ? (
          <ErrorStateCard
            message={t('PAGE.HOME.FEATURED_ERROR')}
            onRetry={loadFeatured}
          />
        ) : (
          <div className="home-featured">
            {featured.map((item) => (
              <Link to={`/product/${item.id}`} key={`${item.brand}-${item.id}`} className="home-card">
                <FavoriteButton item={item} className="fav-btn--overlay" />
                <img src={item.imageUrl} alt={item.name} loading="lazy" />
                <div className="home-card__body">
                  <small>{item.brand}</small>
                  <h3>{item.name}</h3>
                  {item.offers[0] && <strong>{formatPrice(item.offers[0].price)}</strong>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <h2>{t('PAGE.HOME.STORES_TITLE')}</h2>
        <p className="home-muted">{t('PAGE.HOME.STORES_SUBTITLE')}</p>
        <div className="home-stores">
          {STORES.map((s) => (
            <Link
              to={`/products?store=${encodeURIComponent(s.name)}&cat=all`}
              key={s.name}
              className="home-store"
              style={{ background: s.color, textDecoration: 'none' }}
            >
              <strong>{s.name}</strong>
              <span>
                {s.url} • {t('NAV.STORES_VIEW_ALL')} <FiArrowRight style={{ verticalAlign: 'middle' }} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h2>{t('PAGE.HOME.CTA_TITLE')}</h2>
        <Link to="/products" className="btn btn--light">
          {t('PAGE.HOME.CTA_BTN')}
        </Link>
      </section>
    </div>
  );
};

export default Home;
