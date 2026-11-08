import { useI18n } from '../../i18n/I18nProvider';
import './Compare.scss';

const Compare = () => {
  const { t } = useI18n();

  return (
    <div className="compare-page">
      <h1>{t('PAGE.COMMON.HELLO')}</h1>
    </div>
  );
};

export default Compare;
