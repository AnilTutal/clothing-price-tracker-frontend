import { useI18n } from '../../i18n/I18nProvider';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { t } = useI18n();

  return (
    <div className="product-detail-page">
      <h1>{t('PAGE.COMMON.HELLO')}</h1>
    </div>
  );
};

export default ProductDetail;
