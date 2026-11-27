import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useFavorites } from '../../services/favorites';
import { ClothingItem } from '../../types';
import './FavoriteButton.scss';

interface Props {
  item: ClothingItem;
  className?: string;
}

const FavoriteButton = ({ item, className = '' }: Props) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(item);

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'fav-btn--active' : ''} ${className}`}
      aria-pressed={active}
      aria-label="favorite"
      onClick={(e) => {
        // Kart bir linkin içindeyse linke gitmesin
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(item);
      }}
    >
      {active ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
