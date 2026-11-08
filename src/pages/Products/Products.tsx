import { useI18n } from '../../i18n/I18nProvider';
import './Products.scss';

const Products = () => {
  const { t } = useI18n();

  return (
    <div className="products-page">
      <h1>{t('PAGE.COMMON.HELLO')}</h1>
    </div>
  );
};

export default Products;
