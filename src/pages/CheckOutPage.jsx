import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/pages/checkoutpage.css';
import { Modal } from '../components/checkout/ComponentCheckOut';
import { HeaderContext } from '../context/HeaderContext';
import { useUser } from '../hooks/useUser';
import imageLogoBlackBackground from '../assets/mini-logos/mini-logo-black-background.png'

export const CheckOutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState({ price: 0, verySpenses: 0, endingPrice: 0 });
    const [expandedSections, setExpandedSections] = useState({});
    const { user } = useUser();
    const navigate = useNavigate(); // Hook para redirección
    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;
    const { activeMenu, openMenu } = useContext(HeaderContext);

    useEffect(() => {
        if (user === null || user === undefined) {
            // Redirige solo si estamos seguros de que no hay un usuario loggeado
            navigate('/errorPage');
            return;
        }

        const fromCart = localStorage.getItem('authToken');
        if (!fromCart) {
            navigate('/errorPage');
            return;
        }

        // No elimines el token aquí a menos que sea estrictamente necesario
    }, [user, navigate]);

    const removeItem = (product_id) => {
        setCartItems(cartItems.filter(item => item.product_id !== product_id));
    };

    const handleQuantityChange = (product_id, variant_id, newQuantity) => {
        const updatedCartItems = cartItems.map(item =>
            item.product_id._id === product_id && item.variant_id === variant_id
                ? { ...item, quantity: newQuantity }
                : item
        );
        console.log('Cambiando cantidad para el producto: ', { product_id, variant_id });
        console.log('Cantidad actualizada: ', newQuantity);
        console.log('Carrito después de actualizar cantidad: ', updatedCartItems);
    
        setCartItems(updatedCartItems);
    };

    const fetchCartItems = useCallback(async () => {
        if (!user) return;
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('No se encontró el token de autenticación.');
            return;
        }

        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error en la respuesta del servidor:', errorText);
                throw new Error('Error al obtener los artículos del carrito');
            }

            const data = await response.json();
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

    const calculateTotalPrice = useCallback(() => {
        const totalPrice = cartItems.reduce((sum, item) => {
            // Validar si las propiedades existen antes de ejecutar la lógica
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
            return sum; // Si no existen propiedades necesarias, ignorar el cálculo
        }, 0);

        setTotal(prevTotal => ({
            ...prevTotal,
            price: totalPrice,
            endingPrice: totalPrice + prevTotal.verySpenses,
        }));
    }, [cartItems]);


    const addToWishlist = async (productId, variantId) => {
        const token = localStorage.getItem('authToken');

        // Ahora accedemos correctamente al userId del usuario autenticado
        const userId = user?._id;  // Usamos user._id aquí

        console.log("user", user)
        console.log("userId", userId)

        if (!userId || !productId || !variantId) {
            console.error('user_id, product_id y variant_id son requeridos.');
            return;
        }

        if (!token) {
            console.error('No se encontró el token de autenticación.');
            return;
        }

        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ user_id: userId, product_id: productId, variant_id: variantId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al agregar a la wishlist:', errorText);
                throw new Error('No se pudo agregar el producto a la wishlist');
            }

            const data = await response.json();
            console.log('Producto agregado a la wishlist:', data);
            alert('Producto añadido a tu lista de deseos');
        } catch (error) {
            console.error('Error al añadir el producto a la wishlist:', error);
            alert('Hubo un error al añadir a tu lista de deseos');
        }
    };


    const handleOpenSectionModal = (sectionId) => {
        openMenu(`modalInfo_CheckOut_${sectionId}`);
    };


    return (
        <section className="checkoutSection">
            <div className="left-column">
                <div className="infoAboutChanges">
                    <img src={imageLogoBlackBackground} className="black-box"></img>
                    <div className="white-box">Texto neutro</div>
                </div>

                <div className="cartPrev">
                    <div>Mi selección: ({cartItems.length})</div>
                    <div>
                        <button className="view-cart-button" onClick={handleOpenSectionModal}>Ver carrito</button>
                    </div>
                </div>

                <div className="cartDetails">
                    {cartItems.map(item => {
                        const { variant_id, product_id, quantity } = item;

                        const name = product_id?.name || "Producto sin nombre";
                        const variants = product_id?.variants || [];

                        // Declarar selectedVariant primero
                        const selectedVariant = variants.find(
                            variant => variant.variant_id === item.variant_id
                        );
                        const imageUrl = selectedVariant?.image ? selectedVariant.image[0] : null;
                        const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;

                        const adjustQuantity = (operation, product_id, variant_id, quantity) => {
                            let newQuantity = quantity;

                            if (operation === 'increment') {
                                newQuantity += 1;
                            } else if (operation === 'decrement' && quantity > 1) {
                                newQuantity -= 1;
                            }

                            handleQuantityChange(product_id, variant_id, newQuantity);
                        };

                        return (
                            <div key={item._id} className="cart-item">
                                {fullImageUrl ? (
                                    <img src={fullImageUrl} alt={name} />
                                ) : (
                                    <p>Imagen no disponible</p>
                                )}
                                <div className="infoProductCheckOut">
                                    <div className="product-header">
                                        <div className='divCosts'>{product_id?.name || "Nombre no disponible"}</div>
                                    </div>
                                    <div className="upperInformation">
                                        {selectedVariant && (
                                            <p>Color: {selectedVariant.color?.colorName}</p>
                                        )}
                                        <div className="color-size">
                                            <div className='divCosts'>Género:</div>
                                            <div className='divCosts'>{product_id?.gender || "Género no disponible"}</div>
                                        </div>
                                    </div>


                                    <div className="quantity-price">
                                        <div className='divCosts'>
                                            {selectedVariant && selectedVariant?.price
                                                ? `Precio: $${selectedVariant.price}`
                                                : "Precio no disponible"
                                            }
                                        </div>
                                        {/* Cantidad con los botones */}
                                        <div className="quantity-container">
                                            <div className="quantity-header">Cantidad:</div>
                                            <div className="quantity-controls">
                                                <button
                                                    className="quantity-button"
                                                    onClick={() => adjustQuantity('decrement', item.product_id._id, item.variant_id, item.quantity)}
                                                >
                                                    <span className="material-symbols-outlined">remove</span>
                                                </button>
                                                <div className="quantity-number">{item.quantity}</div>
                                                <button
                                                    className="quantity-button"
                                                    onClick={() => adjustQuantity('increment', item.product_id._id, item.variant_id, item.quantity)}
                                                >
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <button
                                            className="favorites-button"
                                            onClick={() => addToWishlist(product_id, variant_id)}
                                        >
                                            Añadir a favoritos
                                        </button>
                                        <button className="remove-button" onClick={() => removeItem(product_id)}>Eliminar del carrito</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="checkout-button-container">
                    <button className="checkout-button">Continuar</button>
                </div>
            </div>

            <div className="columnFlex">
                <div className="right-column">
                    <div className='header-finalBuying'>
                        <div className="totalPrice">
                            <div className='finalPrice-CheckOut'>Subtotal</div>
                            <div className='finalPrice-CheckOutRight'>{total.price.toFixed(2)} €</div>
                        </div>
                        <div className="deliverySpendings">
                            <div className='finalPrice-CheckOut'>Envío</div>
                            <div className='finalPrice-CheckOutRight'>{total.verySpenses} €</div>
                        </div>
                        <div className="finalPriceCheckOut">
                            <div className='finalPrice-CheckOut'>Total</div>
                            <div className='finalPrice-CheckOutRight'>{total.endingPrice.toFixed(2)} €</div>
                        </div>
                        <div className="buyingButtonContainer">
                            <button className='checkout-button'>Continuar</button>
                        </div>
                    </div>
                </div>

                <div className="right-columnInformation">
                    {['pedido', 'envio', 'devolucion', 'atencion'].map((section, index) => (
                        <div key={`${section}-${index}`} className="informationToggle">
                            <div className="groupInformation">
                                <div className="iconAccordion">
                                    {getSectionIcon(section)} {/* Ícono dinámico */}
                                    <div className="accordion-CheckOut">{getSectionTitle(section)}</div>
                                </div>
                                <div className="accordion-CheckOut">
                                    {expandedSections[section] && (
                                        <button className="button cartButton"></button>
                                    )}
                                </div>
                                <button
                                    className="buttonForward"
                                    onClick={() => handleOpenSectionModal(section)}
                                >
                                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                                </button>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
            {activeMenu.startsWith('modalInfo_CheckOut') && <Modal />}
        </section>
    );
};


const getSectionTitle = (section) => {
    switch (section) {
        case 'pedido': return 'Pedido';
        case 'envio': return 'Envío';
        case 'devolucion': return 'Devolución';
        case 'atencion': return 'Atención al Cliente';
        default: return 'Sección';
    }
};

const getSectionContent = (section) => {
    switch (section) {
        case 'pedido': return 'Información sobre el pedido...';
        case 'envio': return 'Detalles del envío...';
        case 'devolucion': return 'Información sobre la política de devoluciones...';
        case 'atencion': return 'Contacta con Atención al Cliente...';
        default: return '';
    }
};

const sections = [
    { id: 'pedido', title: 'Pedido', icon: 'iconPedido' },
    { id: 'envio', title: 'Envío', icon: 'iconEnvio' },
    { id: 'devolucion', title: 'Devolución', icon: 'iconDevolucion' },
    { id: 'atencion', title: 'Atención al Cliente', icon: 'iconAtencion' },
];


const getSectionIcon = (section) => {
    switch (section) {
        case 'pedido':
            return (
                <span className="material-symbols-outlined">
                    shopping_bag
                </span>
            );
        case 'envio':
            return (
                <span className="material-symbols-outlined">
                    local_shipping
                </span>
            );
        case 'devolucion':
            return (
                <span className="material-symbols-outlined">
                    package_2
                </span>
            );
        case 'atencion':
            return (
                <span className="material-symbols-outlined">
                    help
                </span>
            );
        default:
            return null;
    }
};

export default CheckOutPage;
