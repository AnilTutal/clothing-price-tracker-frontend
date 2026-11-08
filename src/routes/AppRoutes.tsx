import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Products from '../pages/Products/Products';
import Compare from '../pages/Compare/Compare';
import ProductDetail from '../pages/ProductDetail/ProductDetail';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  );
};

export default AppRoutes;
