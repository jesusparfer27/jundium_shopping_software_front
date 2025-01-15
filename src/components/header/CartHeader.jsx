import React, { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../context/HeaderContext';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { ProductContext } from '../../pages/admin_page/context/ProductContext';
import '../../css/components/header/cart.css';

const CartContainer = () => {
    const { activeMenu, closeMenu } = useContext(HeaderContext);
    const navigate = useNavigate();
    const { VITE_IMAGES_BASE_URL, VITE_IMAGE } = import.meta.env;
    const {
        hasDiscount,
        renderPriceWithDiscount
    } = useContext(ProductContext) // Llama al contexto de productos para manejar descuentos y precios

    const {
        fetchCartItems,
        cartItems,
        removeFromCart,
    } = useContext(CartContext); // Accede al contexto del carrito para obtener los productos y eliminarlos

    useEffect(() => {
        fetchCartItems(); // Al cargar el componente, obtiene los productos del carrito
    }, [fetchCartItems]); // Se ejecuta solo cuando `fetchCartItems` cambia

    const handleCheckout = () => {
        closeMenu() // Cierra el menú de carrito
        navigate('/check-out'); // Redirige al usuario a la página de pago
    };

    console.log('Productos actualmente en el carrito:', cartItems);

    return (
        <section className={`cartContainer ${activeMenu === 'cart' ? 'active slideIn' : ''}`}>
            {cartItems.length === 0 ? (
                <>
                    <button className="closeContainerCart_noOptions" onClick={closeMenu}><span className="material-symbols-outlined">
                        close
                    </span></button>
                     <div className="emptyCart"> {/*  Muestra mensaje y redirige al usuario si el carrito está vacío  */}

                        <div className="emptyCartMessage">
                            <p>No hay elementos en su carrito.</p>
                        </div>
                        <div className="redirectToHome">
                            <button className="emptyCartButton" onClick={() => navigate('/')}>Ir a la tienda</button>
                        </div>
                    </div>
                </>
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

                     <div className={`cartItems ${cartItems.length >= 3 ? 'scrollableCartItems' : ''}`}> {/* Si el carrito tiene 3 o más items, agrega scroll */}
                        <div className={`cartItems ${cartItems.length >= 3 ? 'scrollableCartItems' : ''}`}>
                            {cartItems.map(item => { // Mapea los productos del carrito
                                const { product_id, variant_id, quantity, size, colorName } = item; // Desestructura la información del producto
                                const name = product_id?.name || "Producto sin nombre"; // Obtiene el nombre del producto
                                const variants = product_id?.variants || []; // Obtiene las variantes del producto
                                const selectedVariant = variants.find(variant => variant.variant_id === variant_id); // Encuentra la variante seleccionada
                                const variantPrice = selectedVariant?.price || 0; // Obtiene el precio de la variante
                                const imageUrl = selectedVariant?.image ? selectedVariant.image[0] : null; // Obtiene la URL de la imagen
                                const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null; // Crea la URL completa de la imagen

                                const hasDiscountApplied = selectedVariant?.discount > 0;

                                const priceToDisplay = renderPriceWithDiscount(selectedVariant);

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
                                            <p className="textCard_Header">{selectedVariant?.name}</p>
                                            {hasDiscountApplied ? (
                                                <>
                                                    <p className="textCard_Header discountedPrice">
                                                        {priceToDisplay}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="textCard_Header">${variantPrice.toFixed(2)}</p>
                                            )}
                                            {quantity > 1 && <p className="textCard_Header">Cantidad: {quantity}</p>}
                                            <p className="textCard_Header">{colorName || 'No especificado'}</p>
                                            <p className="textCard_Header">Talla: {size || 'No especificado'}</p>

                                            <div className="submit-buttonProfile Cart">
                                                <button onClick={() => {
                                                    if (product_id?._id && variant_id) {
                                                        removeFromCart(product_id._id, variant_id);
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

                    <div className="fatherContainer_summary">
                        <div className="cartSummary">
                            <p>Mi Selección</p>
                            <p>Total: ${cartItems.reduce((acc, item) => { // Calcula el total del carrito
                                const selectedVariant = item.product_id?.variants.find(variant => variant.variant_id === item.variant_id);
                                const variantPrice = selectedVariant?.price || 0;
                                const quantity = item.quantity || 1;
                                return acc + (variantPrice * quantity); // Suma el precio de cada producto por su cantidad
                            }, 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="cartButtonContainer">
                        <button className="cart1Button" onClick={handleCheckout}>Ver detalles</button>
                    </div>
                </>
            )}
        </section>
    );
};

export default CartContainer;



