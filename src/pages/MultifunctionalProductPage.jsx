import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/pages/multifunctional_product_page.css';
import { useNavigate } from 'react-router-dom';
import ErrorImage from '../assets/error-image/error-image.jpg'; // Ajusta el path según la ubicación de tu imagen

export const MultifunctionalProductPage = () => {
    const [likedProducts, setLikedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            return; // Usuario no loggeado
        }

        const fetchLikedProducts = async () => {
            try {
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, { headers });
                if (!response.ok) {
                    throw new Error('Error al obtener los productos de la wishlist');
                }

                const data = await response.json();
                if (data && data.items && Array.isArray(data.items)) {
                    setLikedProducts(data.items);
                } else {
                    throw new Error('No se encontraron productos en la wishlist');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedProducts();
    }, []);

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
            setLikedProducts((prevProducts) => prevProducts.filter(item => item.variant_id !== variantId));
        } catch (error) {
            setError('Ocurrió un error al eliminar el producto de la wishlist.');
        }
    };

    const addToCart = (productId, variantId) => {
        navigate(`/products/${productId}?variant_id=${variantId}`);
    };

    if (loading) {
        return <div>Cargando productos...</div>;
    }

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
                                <h1 className='errorText_errorPage'>Para entrar a esta sección debes de estar loggeado</h1>
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

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <section className="wishlistSection">
            <h2 className="wishlistTitle"></h2>
            <div className={likedProducts.length > 0 ? "wishlistContainer" : "wishlistContainerEmpty"}>
                {likedProducts.length > 0 ? (
                    likedProducts.map(item => {
                        const { product_id, variant_id } = item;
                        const { name, base_price, variants } = product_id;

                        const variant = variants?.find(v => v.variant_id === variant_id);
                        const imageUrl = variant?.image?.[0];
                        const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;

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
                                        <div className="productName">{name}</div>
                                        <div className="productPrice">${base_price}</div>
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
