import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useI18n } from '../../i18n/I18nProvider';
import { useFavorites } from '../../services/favorites';
import './Watchlist.scss';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

const Watchlist = () => {
  const { t } = useI18n();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="watchlist-page">
      <header>
        <h1>
          <FaHeart style={{ color: '#ef4444', verticalAlign: 'middle', marginRight: '0.4rem' }} />
          {t('PAGE.WATCHLIST.HEADING')}
        </h1>
        <p>{t('PAGE.WATCHLIST.SUBTITLE')}</p>
      </header>

      {favorites.length === 0 ? (
        <div className="watchlist-empty">
          <span>
            <FaRegHeart />
          </span>
          <p>{t('PAGE.WATCHLIST.EMPTY')}</p>
          <Link to="/products" className="watchlist-btn">
            {t('PAGE.HOME.HERO_CTA_PRIMARY')}
          </Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {favorites.map((f) => (
            <article key={`${f.brand}:${f.id}`} className="watchlist-card">
              <button
                type="button"
                className="watchlist-card__remove"
                onClick={() => removeFavorite(f.brand, f.id)}
                aria-label="remove"
              >
                <FaHeart />
              </button>
              <Link to={`/product/${encodeURIComponent(f.id)}`}>
                <img src={f.imageUrl} alt={f.name} loading="lazy" />
              </Link>
              <div className="watchlist-card__body">
                <small>
                  {f.brand} • {f.category}
                </small>
                <h3>{f.name}</h3>
                <strong>{formatPrice(f.price)}</strong>
                <small className="watchlist-card__hint">{t('PAGE.WATCHLIST.PRICE_AT_ADD')}</small>
                <div className="watchlist-card__actions">
                  <Link to={`/product/${encodeURIComponent(f.id)}`}>{t('PAGE.PRODUCTS.BTN_DETAIL')}</Link>
                  {f.storeUrl && (
                    <a href={f.storeUrl} target="_blank" rel="noopener noreferrer">
                      {t('PAGE.PRODUCTS.BTN_VIEW_STORE')}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
