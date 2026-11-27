import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import {
  FiChevronDown,
  FiHeart,
  FiHome,
  FiLayers,
  FiSettings,
  FiShoppingBag,
  FiTag,
} from 'react-icons/fi';
import { FaMagic, FaTshirt } from 'react-icons/fa';
import { useI18n } from '../../i18n/I18nProvider';
import { useFavorites } from '../../services/favorites';
import { useWardrobe } from '../../services/wardrobe';
import { useTheme } from '../../services/theme';
import './Navbar.scss';

const NAVBAR_STORES = [
  { name: 'Mavi', badge: 'MAVİ', color: '#004b87' },
  { name: 'Bershka', badge: 'BSK', color: '#111827' },
  { name: 'LC Waikiki', badge: 'LCW', color: '#1d4ed8' },
];

const Navbar = () => {
  const { t } = useI18n();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Tema tercihinin uygulama açılışında aktif olmasını sağlar
  useTheme();
  const { favorites } = useFavorites();
  const { items: wardrobeItems } = useWardrobe();

  const [storesOpen, setStoresOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında mağazalar açılır menüsünü kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStoresOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sayfa veya URL parametresi değiştiğinde menüyü kapat
  useEffect(() => {
    setStoresOpen(false);
  }, [location.pathname, location.search]);

  const activeStoreParam =
    location.pathname === '/products' ? searchParams.get('store') : null;

  // Sadece kullanıcı aktif olarak bir ürün detay sayfasındayken (/product/...) sekme gösterilir,
  // sayfadan çıkıldığında üst menüde kalabalık yapmaz.
  const isOnProductDetail = location.pathname.startsWith('/product/');

  return (
    <nav className="navbar">
      <div className="navbar__links">
        <NavLink to="/" className="navbar__link">
          <FiHome className="nav-icon" /> {t('NAV.HOME')}
        </NavLink>

        {/* Birleşik Kıyafetler & Mağazalar Açılır Menüsü */}
        <div
          className="navbar__dropdown"
          ref={dropdownRef}
          onMouseEnter={() => setStoresOpen(true)}
          onMouseLeave={() => setStoresOpen(false)}
        >
          <button
            type="button"
            className={`navbar__dropdown-btn ${
              location.pathname === '/products' ? 'active' : ''
            }`}
            onClick={() => setStoresOpen((prev) => !prev)}
            aria-expanded={storesOpen}
          >
            <FiShoppingBag className="nav-icon" /> {t('NAV.PRODUCTS')}
            {activeStoreParam && activeStoreParam !== 'all'
              ? ` (${activeStoreParam})`
              : ''}
            <FiChevronDown className={`caret ${storesOpen ? 'open' : ''}`} />
          </button>

          {storesOpen && (
            <div className="navbar__dropdown-menu">
              <Link
                to="/products?store=all&cat=all"
                className={`navbar__dropdown-item ${
                  location.pathname === '/products' &&
                  (!activeStoreParam || activeStoreParam === 'all')
                    ? 'active'
                    : ''
                }`}
                onClick={() => setStoresOpen(false)}
              >
                <span
                  className="store-mini-badge"
                  style={{ backgroundColor: '#10b981' }}
                >
                  TÜMÜ
                </span>
                <div className="store-item-text">
                  <strong>{t('PAGE.PRODUCTS.STORE.ALL')}</strong>
                  <small>{t('NAV.STORES_VIEW_ALL')} →</small>
                </div>
              </Link>

              <div className="navbar__dropdown-divider" />

              {NAVBAR_STORES.map((st) => (
                <Link
                  key={st.name}
                  to={`/products?store=${encodeURIComponent(st.name)}&cat=all`}
                  className={`navbar__dropdown-item ${
                    activeStoreParam === st.name ? 'active' : ''
                  }`}
                  onClick={() => setStoresOpen(false)}
                >
                  <span
                    className="store-mini-badge"
                    style={{ backgroundColor: st.color }}
                  >
                    {st.badge}
                  </span>
                  <div className="store-item-text">
                    <strong>{st.name}</strong>
                    <small>{t('NAV.STORES_VIEW_ALL')} →</small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <NavLink to="/compare" className="navbar__link">
          <FiLayers className="nav-icon" /> {t('NAV.COMPARE')}
        </NavLink>
        <NavLink to="/watchlist" className="navbar__link">
          <FiHeart className="nav-icon" /> {t('NAV.WATCHLIST')}
          {favorites.length > 0 ? ` (${favorites.length})` : ''}
        </NavLink>
        <NavLink to="/wardrobe" className="navbar__link">
          <FaTshirt className="nav-icon" /> {t('NAV.WARDROBE')}
          {wardrobeItems.length > 0 ? ` (${wardrobeItems.length})` : ''}
        </NavLink>
        <NavLink to="/outfits" className="navbar__link">
          <FaMagic className="nav-icon" /> {t('NAV.OUTFIT_STUDIO')}
        </NavLink>
        {isOnProductDetail && (
          <NavLink to={location.pathname} className="navbar__link">
            <FiTag className="nav-icon" /> {t('NAV.PRODUCT_DETAIL')}
          </NavLink>
        )}
      </div>

      <div className="navbar__right">
        <NavLink to="/settings" className="navbar__settings-link">
          <FiSettings className="nav-icon" /> {t('NAV.SETTINGS')}
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
