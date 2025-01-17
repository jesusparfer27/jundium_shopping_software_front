import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { useUser } from '../hooks/useUser';

// Contexto para gestionar el estado global del carrito
export const CartContext = createContext();

// Proveedor del contexto del carrito
export const CartProvider = ({ children }) => {
    // Manejo del estado del carrito, usuario, productos y mensajes de error
    const [total, setTotal] = useState({ price: 0, verySpenses: 0, endingPrice: 0 });
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [cartId, setCartId] = useState(null);
    const { user } = useUser();


    const { activeModal, openModal } = useContext(ModalContext);


    const { VITE_API_BACKEND, VITE_PRODUCTS_ENDPOINT, VITE_BACKEND_ENDPOINT } = import.meta.env

    // Función para vaciar el carrito
    const clearCart = async () => {
         // Elimina todos los productos del carrito del usuario autenticado
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token no disponible');
            return;
        }
    
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                console.error('Error al limpiar el carrito:', response.statusText);
                return;
            }
    
            console.log('Carrito limpiado exitosamente');
            // Actualizar el estado del carrito en el contexto
            setCartItems([]);
        } catch (error) {
            console.error('Error al intentar limpiar el carrito:', error);
        }
    };

    // Actualiza los datos del carrito desde el almacenamiento local
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        const storedUserId = localStorage.getItem('userId');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    // Cambia la cantidad de un producto en el carrito
    const handleQuantityChange = async (productId, variantId, newQuantity) => {
        // Actualiza la cantidad de un producto específico
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Por favor, inicia sesión para añadir productos al carrito.');
            return;
        }

        if (newQuantity < 1) return;

        try {
            setCartItems((prevCartItems) =>
                prevCartItems.map((item) =>
                    item.product_id._id === productId && item.variant_id === variantId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, variantId, quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error('No se pudo actualizar la cantidad en el carrito.');
            }
        } catch (error) {
            console.error('Error al actualizar la cantidad:', error);
            setErrorMessage('No se pudo actualizar la cantidad. Inténtalo de nuevo.');
        }
    };

    // Calcula el precio total del carrito
    const calculateTotalPrice = useCallback(() => {
        // Suma los precios de los productos multiplicados por sus cantidades
        const totalPrice = cartItems.reduce((sum, item) => {

            if (
                item?.product_id?.variants &&
                Array.isArray(item.product_id.variants)
            ) {
                const selectedVariant = item.product_id.variants.find(
                    variant => variant.variant_id === item.variant_id
                );
                const basePrice = selectedVariant?.price || 0;
                const quantity = item.quantity || 1;
                return sum + (basePrice * quantity);
            }
            return sum;
        }, 0);

        setTotal(prevTotal => ({
            ...prevTotal,
            price: totalPrice,
            endingPrice: totalPrice + prevTotal.verySpenses,
        }));
    }, [cartItems]);

    // Actualiza el total cada vez que cambian los artículos del carrito
    useEffect(() => {
        calculateTotalPrice();
    }, [cartItems]);

    // Obtiene el ID del usuario desde el token JWT
    const getUserIdFromToken = (token) => {
        // Decodifica el token para extraer el ID del usuario
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    };

    // Añade un producto al carrito
    const handleAddToCart = async () => {
        // Valida y envía el producto seleccionado al backend para agregarlo al carrito
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Por favor, inicia sesión para añadir productos al carrito.');
            openModal('modalNeed_toLogin');
            return;
        }

        if (!selectedSize) {
            openModal("modalSelectSize");
            return;
        }

        const price = selectedVariant?.price;

        console.log('Datos antes de añadir al carrito:', {
            selectedSize,
            selectedVariant,
            product
        });

        console.log("Variante seleccionada:", selectedVariant);
        console.log("Precio seleccionado:", price);

        const userId = getUserIdFromToken(token);
        if (!userId) {
            setErrorMessage('Error al extraer información del usuario.');
            return;
        }

        const productId = product?._id;
        const variantId = selectedVariant?.variant_id;
        const colorName = selectedVariant?.color?.colorName;

        if (!productId || !variantId || !colorName || !price) {
            setErrorMessage('Por favor selecciona un color, tamaño, precio y variante válidos antes de añadir al carrito.');
            console.error('Datos inválidos al añadir al carrito:', { productId, variantId, colorName, selectedSize, price });
            return;
        }

        if (!price || price === undefined || price === null) {
            setErrorMessage('El precio es obligatorio.');
            return;
        }


        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    variant_id: variantId,
                    colorName: colorName,
                    size: selectedSize,
                    quantity: 1,
                    price: price,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al añadir al carrito');
            }

            const data = await response.json();
            console.log('Producto añadido al carrito:', data);
            openModal('modalAdded_toCart');
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            setErrorMessage('Ocurrió un error al añadir el producto al carrito.');
        }
    };


    // Elimina un producto del carrito
    const removeFromCart = async (productId, variantId) => {
        // Elimina un producto específico o disminuye su cantidad
        if (!productId || !variantId) {
            console.error('Faltan el ID del producto o de la variante');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');

            console.log(`Intentando eliminar producto: ${productId}, variante: ${variantId}`);

            const response = await fetch(
                `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart/${productId}/${variantId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'decrease' }),
                }
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(`Error al actualizar el carrito: ${errorResponse.message || response.statusText}`);
            }

            setCartItems((prevItems) =>
                prevItems
                    .map((item) => {
                        if (item.product_id._id === productId && item.variant_id === variantId) {
                            if (item.quantity > 1) {
                                return { ...item, quantity: item.quantity - 1 };
                            }
                            return null;
                        }
                        return item;
                    })
                    .filter(Boolean)
            );
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
        }
    };

    // Obtiene los productos del carrito desde el backend
    const fetchCartItems = useCallback(async () => {
        // Realiza una solicitud para obtener los artículos del carrito del usuario autenticado
        if (!user) return;
    
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (!response.ok) throw new Error('Error al obtener los artículos del carrito');
    
            const data = await response.json();
            if (data._id) setCartId(data._id); // Almacena el ID del carrito
            if (Array.isArray(data.items)) {
                setCartItems(data.items);
            } else {
                console.error('La respuesta del carrito no contiene un arreglo de artículos:', data);
            }
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
        }
    }, [user, VITE_API_BACKEND, VITE_BACKEND_ENDPOINT]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    // Registra los cambios en el carrito
    useEffect(() => {
        console.log('Artículos en el carrito:', cartItems);
    }, [cartItems]);


    // Obtiene el total del carrito
    const getTotal = () => {
        // Calcula el total de precios multiplicados por las cantidades
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            total,
            handleAddToCart,
            removeFromCart,
            getTotal,
            setSelectedVariant,
            setLoading,
            setProduct,
            setSelectedSize,
            handleQuantityChange,
            fetchCartItems,
            setTotal,
            clearCart,
            selectedVariant,
            selectedSize,
            product,
            loading,
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook personalizado para acceder al contexto del carrito
export const useCart = () => useContext(CartContext);
