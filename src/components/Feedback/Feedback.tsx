import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { useI18n } from '../../i18n/I18nProvider';
import './Feedback.scss';

interface SkeletonGridProps {
  count?: number;
  compact?: boolean;
}

/** Ürün listesi yüklenirken gösterilen parıltılı (shimmer) kart iskeletleri */
export const ProductCardSkeletonGrid = ({ count = 8, compact = false }: SkeletonGridProps) => {
  return (
    <div
      className={`skeleton-grid ${compact ? 'skeleton-grid--compact' : ''}`}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-box skeleton-card__img" />
          <div className="skeleton-card__body">
            <div className="skeleton-box skeleton-line skeleton-line--xs" />
            <div className="skeleton-box skeleton-line skeleton-line--md" />
            {!compact && (
              <>
                <div className="skeleton-card__chips">
                  <span className="skeleton-box skeleton-chip" />
                  <span className="skeleton-box skeleton-chip" />
                  <span className="skeleton-box skeleton-chip" />
                </div>
                <div className="skeleton-box skeleton-line skeleton-line--sm" />
                <div className="skeleton-card__actions">
                  <span className="skeleton-box skeleton-btn" />
                  <span className="skeleton-box skeleton-btn" />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Ürün detay sayfası yüklenirken gösterilen iki sütunlu iskelet görünümü */
export const ProductDetailSkeleton = () => {
  return (
    <div className="detail-skeleton" aria-busy="true" aria-live="polite">
      <div className="detail-skeleton__gallery">
        <div className="skeleton-box detail-skeleton__main-img" />
        <div className="detail-skeleton__thumbs">
          <span className="skeleton-box detail-skeleton__thumb" />
          <span className="skeleton-box detail-skeleton__thumb" />
          <span className="skeleton-box detail-skeleton__thumb" />
        </div>
      </div>

      <div className="detail-skeleton__info">
        <div className="skeleton-box skeleton-line skeleton-line--xs" />
        <div className="skeleton-box skeleton-line skeleton-line--lg" />
        <div className="skeleton-box skeleton-line skeleton-line--md" />
        <div className="detail-skeleton__specs">
          <span className="skeleton-box detail-skeleton__spec" />
          <span className="skeleton-box detail-skeleton__spec" />
          <span className="skeleton-box detail-skeleton__spec" />
        </div>
        <div className="skeleton-box detail-skeleton__offer" />
        <div className="skeleton-box detail-skeleton__chart" />
      </div>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** API veya ağ hatası durumunda gösterilen şık hata kartı */
export const ErrorStateCard = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useI18n();

  return (
    <div className="state-card state-card--error" role="alert">
      <div className="state-card__icon">
        <FiAlertTriangle />
      </div>
      <h3 className="state-card__title">{t('STATE.ERROR.TITLE')}</h3>
      <p className="state-card__desc">{message}</p>
      {onRetry && (
        <button type="button" className="state-card__btn" onClick={onRetry}>
          <FiRefreshCw /> {t('STATE.ERROR.RETRY')}
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

/** Liste veya filtre sonucu boş olduğunda gösterilen boş durum kartı */
export const EmptyStateCard = ({
  icon = <FiShoppingBag />,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="state-card">
      <div className="state-card__icon">{icon}</div>
      <h3 className="state-card__title">{title}</h3>
      {description && <p className="state-card__desc">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="state-card__btn">
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button type="button" className="state-card__btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
