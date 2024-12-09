import React, { useContext, useEffect, useState, useCallback } from 'react';
import { HeaderContext } from '../../context/HeaderContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import '../../css/components/header/cart.css';


const CartContainer = () => {
    const { activeMenu, closeMenu } = useContext(HeaderContext);
    const navigate = useNavigate();
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT, VITE_IMAGES_BASE_URL, VITE_IMAGE } = import.meta.env;
    const { user } = useUser();
    const [cartItems, setCartItems] = useState([]);

    const fetchCartItems = useCallback(async () => {
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

            // Asegúrate de que 'items' existe y es un arreglo
            if (Array.isArray(data.items)) {
                setCartItems(data.items);
            } else {
                console.error('La respuesta del carrito no contiene un arreglo de artículos:', data);
            }
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
        }
    }, [VITE_API_BACKEND, VITE_BACKEND_ENDPOINT, user]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const handleCheckout = () => {
        closeMenu()
        // Redirige a la página de detalles de compra
        navigate('/check-out');
    };



    const handleRemoveItem = async (productId, variantId) => {
        if (!productId || !variantId) {
            console.error('Faltan el ID del producto o de la variante');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart/${productId}/${variantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'decrease' }),
            });

            if (!response.ok) {
                const errorResponse = await response.json(); // Obtener la respuesta de error
                throw new Error(`Error al actualizar el producto en el carrito: ${errorResponse.message || response.statusText}`);
            }

            // Actualiza el estado eliminando el item localmente
            setCartItems((prevItems) =>
                prevItems.filter(item => !(item.product_id._id === productId && item.variant_id === variantId))
            );

        } catch (error) {
            console.error('Error al actualizar el producto en el carrito:', error);
        }
    };



    console.log('Productos actualmente en el carrito:', cartItems);

    return (
        <section className={`cartContainer ${activeMenu === 'cart' ? 'active slideIn' : ''}`}>
            {cartItems.length === 0 ? (
                <div className="emptyCart">
                    <div className="emptyCartMessage">
                        <p>No hay elementos en su carrito.</p>
                    </div>
                    <div className="redirectToHome">
                        <button className="emptyCartButton" onClick={() => navigate('/')}>Ir a la tienda</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="cartHeader">
                        <div className="cartTitle">
                            <p>Mi Carrito</p>
                            <button className="closeContainerCart" onClick={closeMenu}><span className="material-symbols-outlined">
                                close
                            </span></button>
                        </div>
                    </div>

                    <div className={`cartItems ${cartItems.length >= 3 ? 'scrollableCartItems' : ''}`}>
                        <div className={`cartItems ${cartItems.length >= 3 ? 'scrollableCartItems' : ''}`}>
                            {cartItems.map(item => {
                                const { product_id, variant_id, quantity, size, colorName } = item;

                                const name = product_id?.name || "Producto sin nombre";
                                const variants = product_id?.variants || [];
                                const selectedVariant = variants.find(variant => variant.variant_id === variant_id);
                                const variantPrice = selectedVariant?.price || 0;
                                const imageUrl = selectedVariant?.image ? selectedVariant.image[0] : null;
                                const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;

                                // Log para capturar el tamaño recibido directamente desde el item
                                console.log(`Tamaño recibido para el carrito: ${size}`);

                                return (
                                    <div key={item._id} className="cartItem">
                                        <div className="cartItemImage">
                                            {fullImageUrl ? (
                                                <img src={fullImageUrl} alt={name} />
                                            ) : (
                                                <p>Imagen no disponible</p>
                                            )}
                                        </div>
                                        <div className="cartItemContent">
                                            <p className="textCard_Header">{name}</p>
                                            <p className="textCard_Header">${variantPrice.toFixed(2)}</p>
                                            {/* <p className="textCard_Header">Cantidad: {quantity || 1}</p> */}
                                            <p className="textCard_Header">{colorName || 'No especificado'}</p>
                                            <p className="textCard_Header">size: {size || 'No especificado'}</p>

                                            <div className="submit-buttonProfile Cart">
                                                <button onClick={() => {
                                                    if (product_id?._id && variant_id) {
                                                        handleRemoveItem(product_id._id, variant_id);
                                                    } else {
                                                        console.error('Faltan el ID del producto o de la variante:', item);
                                                    }
                                                }}>Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>

                    <div className="cartSummary">
                        <p>Mi Selección</p>
                        <p>Total: ${cartItems.reduce((acc, item) => {
                            const selectedVariant = item.product_id?.variants.find(variant => variant.variant_id === item.variant_id);
                            const variantPrice = selectedVariant?.price || 0;
                            const quantity = item.quantity || 1; // Accede a la cantidad en item
                            return acc + (variantPrice * quantity);
                        }, 0).toFixed(2)}</p>
                    </div>

                    <div className="checkoutButtonContainer">
                        <button className="checkoutButton" onClick={handleCheckout}>Ver detalles</button>
                    </div>
                </>
            )}
        </section>
    );
};

export default CartContainer;
