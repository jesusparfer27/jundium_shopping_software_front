import React, { createContext, useState, useContext, useEffect, } from 'react';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { useUser } from '../hooks/useUser';

// Contexto para manejar la lógica de la wishlist
export const WishlistContext = createContext();

// Proveedor del contexto
export const WishlistProvider = ({ children }) => {

    const { user } = useUser(); // Obtiene los datos del usuario actual
    const { activeModal, openModal } = useContext(ModalContext); // Usa el contexto del modal
    const [wishlistData, setWishlistData] = useState([]); // Estado para la información de la wishlist
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env

    // Agrega un producto a la wishlist del usuario
    const handleAddToWishlist = async (productId, variantId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            openWishlistModal('modalNeed_toLogin'); // Pide login si no hay token
            return;
        }

        try {
            // Obtiene la wishlist del usuario
            let wishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            // Si no existe, crea una nueva wishlist
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

                // Vuelve a obtener la wishlist
                wishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!wishlistResponse.ok) {
                    throw new Error('Error al obtener la wishlist después de crearla.');
                }
            }

            const wishlistData = await wishlistResponse.json(); // Convierte la respuesta a JSON

            console.log('Estructura de wishlistData:', wishlistData);

            // Verifica si la estructura de la wishlist es válida
            if (!wishlistData || !Array.isArray(wishlistData.items)) {
                throw new Error('La estructura de la wishlist no es válida.');
            }

            // Comprueba si el producto ya está en la wishlist
            const productExists = wishlistData.items.some(
                (item) => item.variant_id === variantId
            );

            console.log("esto es wishlistData", wishlistData)

            if (productExists) {
                openWishlistModal('modalAlready_inWishlist'); // Modal: producto ya en la wishlist
                return;
            }

            // Agrega el producto a la wishlist
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

            openWishlistModal('modalAdded_toWishlist'); // Modal: producto agregado con éxito
        } catch (error) {
            console.error('Error al procesar la solicitud de wishlist:', error.message);
            openWishlistModal('modalError'); // Modal: error genérico
        }
    };


    const openWishlistModal = (menuState) => {
        console.log(`Abriendo modal: ${menuState}`);
        openModal(menuState); // Usa el método del contexto ModalContext
    };

    return (
        <WishlistContext.Provider value={{
            handleAddToWishlist, // Función principal para agregar a la wishlist
            openWishlistModal,   // Abre modales según el estado
            wishlistData         // Estado de la wishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

// Hook para consumir el contexto de la wishlist
export const useWishlist = () => useContext(WishlistContext);
