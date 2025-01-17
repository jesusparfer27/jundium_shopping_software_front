import React from 'react';
import { StrictMode } from 'react';
import router from './lib/Routes.jsx';
import { RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { UserProvider } from '../src/hooks/useUser.jsx';
import { ProductProvider } from './pages/admin_page/context/ProductContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ModalProvider } from './components/modal-wishlist/ModalContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import '../src/css/main/main.css';

// Renderiza la aplicación con todos los contextos envueltos
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ModalProvider>
        <WishlistProvider>
          <CartProvider>
            <ProductProvider>
              <RouterProvider router={router} />
            </ProductProvider>
          </CartProvider>
        </WishlistProvider>
      </ModalProvider>
    </UserProvider>
  </React.StrictMode>
);
