import React, { createContext, useState, useContext, useEffect,} from 'react';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { useUser } from '../hooks/useUser';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    
    const { user } = useUser();
    const { activeModal, openModal } = useContext(ModalContext);
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
                const createWishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({}),
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
            console.log('Datos de la wishlist:', wishlistData);
        } catch (error) {
            console.error('Error al procesar la solicitud de wishlist:', error.message);
            openWishlistModal('modalNeed_toLogin');
        }
    };

        const openWishlistModal = (menuState) => {
            console.log(`Abriendo modal: ${menuState}`);
            openModal(menuState);
        };

    return (
        <WishlistContext.Provider value={{
            handleAddToWishlist,
            openWishlistModal
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
