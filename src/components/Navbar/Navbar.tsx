import { NavLink } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import './Navbar.scss';

const Navbar = () => {
  const { t, lang, setLang } = useI18n();

  return (
    <nav className="navbar">
      <div className="navbar__links">
        <NavLink to="/" className="navbar__link">
          {t('NAV.HOME')}
        </NavLink>
        <NavLink to="/products" className="navbar__link">
          {t('NAV.PRODUCTS')}
        </NavLink>
        <NavLink to="/compare" className="navbar__link">
          {t('NAV.COMPARE')}
        </NavLink>
        <NavLink to="/product/1" className="navbar__link">
          {t('NAV.PRODUCT_DETAIL')}
        </NavLink>
      </div>

      <div className="navbar__lang">
        <button
          type="button"
          className={`navbar__lang-btn ${lang === 'tr' ? 'active' : ''}`}
          onClick={() => setLang('tr')}
        >
          TR
        </button>
        <button
          type="button"
          className={`navbar__lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
