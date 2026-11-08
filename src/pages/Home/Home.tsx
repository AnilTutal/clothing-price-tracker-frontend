import { useI18n } from '../../i18n/I18nProvider';
import './Home.scss';

const Home = () => {
  const { t } = useI18n();

  return (
    <div className="home-page">
      <h1>{t('PAGE.COMMON.HELLO')}</h1>
    </div>
  );
};

export default Home;
