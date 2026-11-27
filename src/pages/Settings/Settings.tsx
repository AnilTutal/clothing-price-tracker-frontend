import { FiGlobe, FiMoon, FiSettings, FiSun } from 'react-icons/fi';
import { useI18n } from '../../i18n/I18nProvider';
import { useTheme } from '../../services/theme';
import './Settings.scss';

const Settings = () => {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>
          <FiSettings style={{ verticalAlign: 'middle', marginRight: '0.45rem' }} />
          {t('PAGE.SETTINGS.HEADING')}
        </h1>
        <p>{t('PAGE.SETTINGS.SUBTITLE')}</p>
      </header>

      <div className="settings-list">
        {/* Görünüm / Karanlık Mod */}
        <section className="settings-card">
          <div className="settings-card__info">
            <h2>{t('PAGE.SETTINGS.THEME_TITLE')}</h2>
            <p>{t('PAGE.SETTINGS.THEME_DESC')}</p>
          </div>
          <div className="settings-options">
            <button
              type="button"
              className={`settings-opt ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <FiSun style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
              {t('PAGE.SETTINGS.THEME_LIGHT')}
            </button>
            <button
              type="button"
              className={`settings-opt ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <FiMoon style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
              {t('PAGE.SETTINGS.THEME_DARK')}
            </button>
          </div>
        </section>

        {/* Dil Seçimi (TR / EN) */}
        <section className="settings-card">
          <div className="settings-card__info">
            <h2>{t('PAGE.SETTINGS.LANG_TITLE')}</h2>
            <p>{t('PAGE.SETTINGS.LANG_DESC')}</p>
          </div>
          <div className="settings-options">
            <button
              type="button"
              className={`settings-opt ${lang === 'tr' ? 'active' : ''}`}
              onClick={() => setLang('tr')}
            >
              <FiGlobe style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
              {t('PAGE.SETTINGS.LANG_TR')}
            </button>
            <button
              type="button"
              className={`settings-opt ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              <FiGlobe style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
              {t('PAGE.SETTINGS.LANG_EN')}
            </button>
          </div>
        </section>

        {/* İleride eklenecek ayarlar için boş alan */}
        <section className="settings-card settings-card--placeholder">
          <div className="settings-card__info">
            <h2>{t('PAGE.SETTINGS.MORE_TITLE')}</h2>
            <p>{t('PAGE.SETTINGS.MORE_DESC')}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
