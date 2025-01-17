    import React, { useState, useEffect } from 'react';
    import { NavLink } from 'react-router-dom';
    import '../css/pages/multifunctional_product_page.css';
    import { useNavigate } from 'react-router-dom';
    import { useContext } from 'react';
    import { ProductContext } from './admin_page/context/ProductContext';
    import ErrorImage from '../assets/error-image/error-image.jpg'; 

    // Componente principal para la página de productos multifuncionales
    export const MultifunctionalProductPage = () => {
        // Estados locales
        const [likedProducts, setLikedProducts] = useState([]); // Lista de productos favoritos
        const [loading, setLoading] = useState(true); // Estado de carga
        const [error, setError] = useState(null); // Estado para manejar errores
        const navigate = useNavigate(); // Hook para redireccionar
        const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env; // Variables de entorno

        // Contexto para lógica adicional relacionada con los productos
        const { hasDiscount, renderPriceWithDiscount } = useContext(ProductContext)

        // Efecto para obtener productos de la wishlist al cargar el componente
        useEffect(() => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return; // Usuario no loggeado
            }

            // Función para obtener los productos favoritos del usuario
            const fetchLikedProducts = async () => {
                try {
                    const headers = {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    };

                    // Petición para obtener la wishlist
                    const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, { headers });
                    if (!response.ok) {
                        throw new Error('Error al obtener los productos de la wishlist');
                    }

                    const data = await response.json();
                    // Verificar si hay datos en la respuesta
                    if (data && data.items && Array.isArray(data.items)) {
                        setLikedProducts(data.items); // Actualizar lista de productos
                    } else {
                        throw new Error('No se encontraron productos en la wishlist');
                    }
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false); // Finalizar carga
                }
            };

            fetchLikedProducts();
        }, []);

        // Función para eliminar un producto de la wishlist
        const handleRemoveFromWishlist = async (productId, variantId) => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('Por favor, inicia sesión para eliminar productos de la wishlist.');
                return;
            }

            if (!productId || !variantId) {
                console.error('Falta productId o variantId:', { productId, variantId });
                setError('No se pudo eliminar de la wishlist debido a un problema con los datos del producto.');
                return;
            }

            try {
                // Petición para eliminar el producto
                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist/${productId}/${variantId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        variant_id: variantId,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar de la wishlist');
                }

                const data = await response.json();
                // Actualizar lista local eliminando el producto
                setLikedProducts((prevProducts) => prevProducts.filter(item => item.variant_id !== variantId));
            } catch (error) {
                setError('Ocurrió un error al eliminar el producto de la wishlist.');
            }
        };

        // Función para redireccionar al usuario al detalle de un producto
        const addToCart = (productId, variantId) => {
            navigate(`/products/${productId}?variant_id=${variantId}`);
        };

        // Renderizar vista de carga
        if (loading) {
            return <div>Cargando productos...</div>;
        }

        // Vista si el usuario no ha iniciado sesión
        if (!localStorage.getItem('authToken')) {
            return (
                <>
                    <section>
                        <div className="container_errorPage">
                            <div className="container_errorImage">
                                <img className='errorImage_Left' src={ErrorImage} alt="Error" />
                            </div>
                            <div className="container_errorRedirection">
                                <div className="block_errorRedirection">
                                    <h1 className='errorText_errorPage'>Para entrar a esta sección debes de iniciar sesión</h1>
                                    <h1 className='errorText_errorPage'>Empieza ahora y guarda los articulos que más te gusten</h1>
                                    <div className="button_errorContainer">
                                        <NavLink to="/" className='buttonError'>Ir a inicio</NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            );
        }

        // Vista si ocurre un error
        if (error) {
            return <div>Error: {error}</div>;
        }

        // Renderizar productos de la wishlist
        return (
            <section className="wishlistSection">
                <div className={likedProducts.length > 0 ? "wishlistContainer" : "wishlistContainerEmpty"}>
                    {likedProducts.length > 0 ? (
                        likedProducts.map(item => {
                            const { product_id, variant_id } = item;
                            const { name, variants } = product_id; // No es necesario obtener 'price' aquí

                            const variant = variants?.find(v => v.variant_id === variant_id);
                            const imageUrl = variant?.showing_image;
                            const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;
                            const selectedVariant = variants.find(variant => variant.variant_id === variant_id);
                            const variantPrice = selectedVariant?.price || 0; // Precio base de la variante
                            const hasDiscountApplied = selectedVariant?.discount > 0;

                            // Usamos renderPriceWithDiscount para obtener el precio final con descuento
                            const priceToDisplay = renderPriceWithDiscount(selectedVariant);

                            return (
                                <div key={variant_id} className="wishlistItem">
                                    <div className="imageContainer">
                                        {fullImageUrl ? (
                                            <img src={fullImageUrl} alt={name} />
                                        ) : (
                                            <p>Imagen no disponible</p>
                                        )}
                                    </div>

                                    <div className="detailsContainer">
                                        <div className="removeItem_Wishlist">
                                            <button className='removeItem_WishlistButton' onClick={() => handleRemoveFromWishlist(product_id._id, variant_id)}>
                                                <span className="material-symbols-outlined">
                                                    close
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="productInfoRow">
                                        <div className="productInfoColumn">
                                            <div className="productName">{variant?.name}</div>
                                            <div className="productPrice">
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
                                        <div className="addToCartButtonContainer">
                                            <button className="addToCartButton" onClick={() => addToCart(product_id._id, variant_id)}>
                                                <div className="spanLink_Container">
                                                    <span className="material-symbols-outlined">
                                                        visibility
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <section className='noWishlist'>
                            <div className="container_errorPage">
                                <div className="container_errorImage">
                                    <img className='errorImage_Left' src={ErrorImage} alt="Error" />
                                </div>
                                <div className="container_errorRedirection">
                                    <div className="block_errorRedirection">
                                        <h1 className='errorText_errorPage'>Aun no tienes artículos en tu lista de deseos</h1>
                                        <h1 className='errorText_errorPage'>Empieza ahora y guarda los articulos que más te gusten</h1>
                                        <div className="button_errorContainer">
                                            <NavLink to="/" className='buttonError'>Ir a inicio</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </section>
        );
    };

    export default MultifunctionalProductPage;
