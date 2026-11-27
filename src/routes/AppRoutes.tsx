import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Products from '../pages/Products/Products';
import Compare from '../pages/Compare/Compare';
import Watchlist from '../pages/Watchlist/Watchlist';
import Wardrobe from '../pages/Wardrobe/Wardrobe';
import OutfitStudio from '../pages/OutfitStudio/OutfitStudio';
import Settings from '../pages/Settings/Settings';
import ProductDetail from '../pages/ProductDetail/ProductDetail';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/wardrobe" element={<Wardrobe />} />
      <Route path="/outfits" element={<OutfitStudio />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  );
};

export default AppRoutes;
