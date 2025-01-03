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
import { ProductContext } from './admin_page/context/ProductContext';
import imageLogoBlackBackground from '../assets/mini-logos/mini-logo-black-background.png'

export const CheckOutPage = () => {
    const [expandedSections, setExpandedSections] = useState({});
    const { user } = useUser();
    const { activeModal, openModal } = useContext(ModalContext);
    const navigate = useNavigate();
    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;
    const { activeMenu, openMenu } = useContext(HeaderContext);
    const {
        hasDiscount,
        renderPriceWithDiscount
    } = useContext(ProductContext)

    const {
        handleAddToWishlist,
    } = useContext(WishlistContext);

    const {
        total,
        cartItems,
        handleQuantityChange,
        removeFromCart,
        clearCart
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
    

    const checkStockAvailability = () => {
        for (let item of cartItems) {
            const variant = item.product_id.variants.find(v => v.variant_id === item.variant_id);
            const size = variant.sizes.find(s => s.size === item.size);
    
            if (size && size.stock < item.quantity) {
                openModal('modalOutOfStock'); // Abre el modal de stock insuficiente
                return false; // Detener el checkout si no hay suficiente stock
            }
        }
        return true; // Si todo está bien, continuar con el checkout
    };
   

    const handleCheckout = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No se está recibiendo el token');
          return;
        }
        if (!user) {
          return <div>Inicia sesión para continuar con el proceso de pago.</div>;
        }
      
        if (!checkStockAvailability()) {
          return; // Detener proceso si no hay stock suficiente
        }
        console.log("User before checkout:", user);
      
        const items = cartItems.map(item => ({
          product_id: item.product_id._id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
          colorName: item.colorName,
          size: item.size,
        }));
      
        const body = {
          items,
          total: total.price,
          user_id: user._id,
          status: 'Pending',
        };
      
        console.log("Request body:", body);
      
        try {
          // Realiza el pedido
          const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log('Pedido creado:', data);
            openModal('modalOrderSuccessful');
      
            setTimeout(() => {
              navigate('/');  // Redirige a la página principal
            }, 3000);  // Espera 3 segundos
      
            // Actualiza el stock de los productos comprados
            for (let item of items) {
              const { product_id, variant_id, quantity } = item;
              const variant = item.product_id.variants.find(v => v.variant_id === variant_id);
              const sizes = variant.sizes.find(s => s.size === item.size);
      
              if (sizes && sizes.stock >= quantity) {
                const updatedSize = { ...sizes, stock: sizes.stock - quantity };
      
                // Enviar la actualización de stock a la API
                const updateResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/update-product-size`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    product_id,
                    variant_id,
                    size: item.size,
                    stock: updatedSize.stock,
                  }),
                });
      
                if (!updateResponse.ok) {
                  console.error(`Error al actualizar stock de tamaño ${item.size} para el producto ${product_id}`);
                } else {
                  console.log(`Stock actualizado para el producto ${product_id}, tamaño ${item.size}`);
                  logUpdatedStock(product_id, item.size, updatedSize.stock); // Mostrar el stock actualizado
                }
              } else {
                console.error(`No hay suficiente stock para el producto ${product_id} en la talla ${item.size}`);
              }
            }
      
            await clearCart();
            console.log('clearCart ejecutado');
      
          } else {
            console.error('Error al crear el pedido:', data.message);
          }
        } catch (error) {
          console.error('Error en la solicitud:', error);
        }
      };
      
    
    
    // Método para registrar el stock actualizado
    const logUpdatedStock = (productId, size, stock) => {
        console.log(`Stock restante del producto ${productId} para la talla ${size}: ${stock}`);
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
                        const imageUrl = selectedVariant?.image ? selectedVariant?.showing_image : null;
                        const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;
                        const variantPrice = selectedVariant?.price || 0;
                    
                        // Usamos hasDiscount para verificar si hay descuento
                        const hasDiscountApplied = selectedVariant?.discount > 0;
                    
                        // Usamos renderPriceWithDiscount para obtener el precio final con descuento
                        const priceToDisplay = renderPriceWithDiscount(selectedVariant);

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
                    <button onClick={handleCheckout} className="checkoutButton">Continuar</button>
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
                            <button onClick={handleCheckout} className='checkout-button'>Continuar</button>
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
