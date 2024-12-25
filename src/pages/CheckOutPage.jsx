import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/pages/checkoutpage.css';
import { Modal } from '../components/checkout/ComponentCheckOut';
import { HeaderContext } from '../context/HeaderContext';
import { ModalContext } from '../components/modal-wishlist/ModalContext'
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { MultifunctionalModal } from '../components/modal-wishlist/MultifunctionalModal'
import { useUser } from '../hooks/useUser';
import imageLogoBlackBackground from '../assets/mini-logos/mini-logo-black-background.png'

export const CheckOutPage = () => {
    const [expandedSections, setExpandedSections] = useState({});
    const { user } = useUser();
    const { activeModal, openModal } = useContext(ModalContext);
    const navigate = useNavigate();
    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;
    const { activeMenu, openMenu } = useContext(HeaderContext);

    const { 
        handleAddToWishlist,
     } = useContext(WishlistContext);

    const { 
        total,
        cartItems,
        handleQuantityChange,
        removeFromCart,
     } = useContext(CartContext);


    useEffect(() => {
        if (user === null || user === undefined) {
            navigate('/errorPage');
            return;
        }

        const fromCart = localStorage.getItem('authToken');
        if (!fromCart) {
            navigate('/errorPage');
            return;
        }

    }, [user, navigate]);

    
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
                    <div>Mi selección: ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</div>
                    <div>
                        {/* <button className="view-cart-button" onClick={handleOpenSectionModal}>Ver carrito</button> */}
                    </div>
                </div>

                <div className="cartDetails">
                    {cartItems.map(item => {
                        const { variant_id, product_id, quantity } = item;

                        const name = product_id?.name || "Producto sin nombre";
                        const variants = product_id?.variants || [];

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
                                    <img className='imageCheckOut_product' src={fullImageUrl} alt={name} />
                                ) : (
                                    <p>Imagen no disponible</p>
                                )}
                                <div className="infoProductCheckOut">
                                    <div className="productHeader_checkout">
                                        <div className="product-header">
                                            <div className='divCosts'>{selectedVariant?.name || "Nombre no disponible"}</div>
                                        </div>
                                        <div className="upperInformation">
                                            {selectedVariant && selectedVariant.color && (
                                                <div className="color-container">
                                                    <span className="color-label">Color:</span>
                                                    <span className="color-value">{selectedVariant.color.colorName}</span>
                                                </div>
                                            )}
                                            <div className="gender-container">
                                                <div className="divGender">Género:</div>
                                                <div className="divGender">{product_id?.gender || "Género no disponible"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="quantity-price">
                                        <div className="divCosts">
                                            {selectedVariant && selectedVariant?.price ? (
                                                <div className='groupCheckout_price'>
                                                    <p>Precio:</p>
                                                    <p>${selectedVariant.price}</p>
                                                </div>
                                            ) : (
                                                <p>Precio no disponible</p>
                                            )}
                                        </div>
                                    </div>


                                    <div className="quantity-price">
                                        <div className="divCosts">
                                            {selectedVariant?.sizes && selectedVariant.sizes.length > 0 ? (
                                                <div className="sizeContainer_checkout">
                                                    <span className="size-label">Talla:</span>
                                                    <span className="size-value">{selectedVariant.sizes[0].size}</span>
                                                </div>
                                            ) : (
                                                <span className="size-unavailable">Talla no disponible</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="quantity-price">
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
                                            onClick={() => handleAddToWishlist(product_id, variant_id)}
                                        >
                                            Añadir a favoritos
                                        </button>
                                        <button className="remove-button" onClick={() => removeFromCart(product_id._id, variant_id)}>Eliminar del carrito</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="checkout-button-container">
                    <button className="checkoutButton">Continuar</button>
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
                                    {getSectionIcon(section)}
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
            {activeModal && <MultifunctionalModal />}
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
