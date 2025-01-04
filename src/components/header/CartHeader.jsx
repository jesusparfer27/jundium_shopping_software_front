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
    } = useContext(ProductContext)

    const {
        // loading,
        // setErrorMessage,
        // errorMessage,
        fetchCartItems,
        // setSelectedSize,
        // selectedVariant,
        cartItems,
        // setCartItems,
        removeFromCart,
        // product,
        // setProduct
    } = useContext(CartContext);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const handleCheckout = () => {
        closeMenu()
        navigate('/check-out');
    };

    console.log('Productos actualmente en el carrito:', cartItems);

    return (
        <section className={`cartContainer ${activeMenu === 'cart' ? 'active slideIn' : ''}`}>
            {cartItems.length === 0 ? (
                <>
                    <button className="closeContainerCart_noOptions" onClick={closeMenu}><span className="material-symbols-outlined">
                        close
                    </span></button>
                    <div className="emptyCart">

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

                                // Usamos hasDiscount para verificar si hay descuento
                                const hasDiscountApplied = selectedVariant?.discount > 0;

                                // Usamos renderPriceWithDiscount para obtener el precio final con descuento
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
                                                    {/* <p className="textCard_Header originalPrice">
                                                        Antes: ${variantPrice.toFixed(2)}
                                                    </p> */}
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
                            <p>Total: ${cartItems.reduce((acc, item) => {
                                const selectedVariant = item.product_id?.variants.find(variant => variant.variant_id === item.variant_id);
                                const variantPrice = selectedVariant?.price || 0;
                                const quantity = item.quantity || 1;
                                return acc + (variantPrice * quantity);
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



