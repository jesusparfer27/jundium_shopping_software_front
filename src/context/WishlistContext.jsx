import React, { createContext, useState, useContext, useEffect, } from 'react';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { useUser } from '../hooks/useUser';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {

    const { user } = useUser();
    const { activeModal, openModal } = useContext(ModalContext);
    const [wishlistData, setWishlistData] = useState([])
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env


    const handleAddToWishlist = async (productId, variantId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            openWishlistModal('modalNeed_toLogin');
            return;
        }

        try {
            let wishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!wishlistResponse.ok && wishlistResponse.status === 404) {
                const createWishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist/create`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!createWishlistResponse.ok) {
                    throw new Error('Error al crear la wishlist.');
                }

                wishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!wishlistResponse.ok) {
                    throw new Error('Error al obtener la wishlist después de crearla.');
                }
            }

            const wishlistData = await wishlistResponse.json();

            console.log('Estructura de wishlistData:', wishlistData);

            if (!wishlistData || !Array.isArray(wishlistData.items)) {
                throw new Error('La estructura de la wishlist no es válida.');
            }

            const productExists = wishlistData.items.some(
                (item) => item.variant_id === variantId
            );

            console.log("esto es wishlistData", wishlistData)

            if (productExists) {
                openWishlistModal('modalAlready_inWishlist');
                return;
            }

            const addProductResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ product_id: productId, variant_id: variantId }),
            });

            if (!addProductResponse.ok) {
                throw new Error('Error al agregar el producto a la wishlist.');
            }

            openWishlistModal('modalAdded_toWishlist');
        } catch (error) {
            console.error('Error al procesar la solicitud de wishlist:', error.message);
            openWishlistModal('modalError');
        }
    };


    const openWishlistModal = (menuState) => {
        console.log(`Abriendo modal: ${menuState}`);
        openModal(menuState);
    };

    return (
        <WishlistContext.Provider value={{
            handleAddToWishlist,
            openWishlistModal,
            wishlistData
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
