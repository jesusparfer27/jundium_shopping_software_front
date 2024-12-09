    import React, { useState, useEffect, useContext } from 'react';
    import { NavLink, useLocation, useParams } from 'react-router-dom';
    import { ModalContext } from '../components/modal-wishlist/ModalContext';
    import { MultifunctionalModal } from '../components/modal-wishlist/MultifunctionalModal';
    import '../css/pages/product_page.css';

    import AutumnImage from '../assets/home-sections/autumn-session-home.jpg';
    import SpringImage from '../assets/season-images-product_page/example-spring-season.jpg';
    import SummerImage from '../assets/season-images-product_page/example-summer-season.jpg';
    import WinterImage from '../assets/home-sections/winter-session-home.jpg';

    export const ProductsPage = () => {
        const { activeModal, openModal} = useContext(ModalContext);
        const { id } = useParams();
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null); 
        const [errorMessage, setErrorMessage] = useState("");

        const { VITE_API_BACKEND, VITE_PRODUCTS_ENDPOINT, VITE_BACKEND_ENDPOINT, VITE_IMAGES_BASE_URL, VITE_IMAGE } = import.meta.env;

        const location = useLocation();
        const searchParams = new URLSearchParams(location.search);

        const typeParam = searchParams.get('type');
        const searchTerm = searchParams.get('search');
        const genderParam = searchParams.get('gender');
        const collectionParam = searchParams.get('collection');
        const variantIdParam = searchParams.get('variant_id');

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
        
            try {
                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}`);
                if (!response.ok) throw new Error('Error al cargar los productos');
                const data = await response.json();
        
                // Filtra productos por tipo, género, colección
                const filteredProducts = data.filter(product => {
                    const genderMatch = !genderParam || product.gender === genderParam;
                    const typeMatch = !typeParam || product.type === typeParam;
                    const collectionMatch = !collectionParam || product.collection === collectionParam;
                    const nameMatch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
                    return genderMatch && typeMatch && collectionMatch && nameMatch;
                });
        
                // Desglosa todas las variantes de productos filtrados
                const productsWithVariants = filteredProducts.flatMap(product =>
                    product.variants.map(variant => ({
                        ...product,
                        selectedVariant: variant, // Variante seleccionada
                        price: variant.price || product.base_price, // Usa el precio de la variante o el base_price como fallback
                        discount: variant.discount || product.discount, // Usa el descuento de la variante o el del producto
                    }))
                );
        
                setProducts(productsWithVariants);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };        

        useEffect(() => {
            fetchProducts();
        }, [searchTerm, typeParam, genderParam, collectionParam]);

        const handleVariantSelect = (productId, variantId) => {
            // Redirige a la página de detalles del producto con el variant_id como parámetro
            window.location.href = `/products/${productId}?variant_id=${variantId}`;
        };

        const openWishlistModal = (menuState) => {
            console.log("Abriendo modal con estado:", menuState); // Debug
            openModal(menuState); // Abre el modal con el estado que corresponda
        };

        const handleAddToWishlist = async (productId, variantId) => {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                openWishlistModal('modalNeed_toLogin');
                return;
            }
        
            try {
                // Comprueba si el producto ya está en la wishlist
                const wishlistResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
        
                if (!wishlistResponse.ok) throw new Error('Error al obtener la wishlist.');
        
                const wishlist = await wishlistResponse.json();
                console.log("Wishlist recibida:", wishlist);

                const wishlistItems = Array.isArray(wishlist) ? wishlist : wishlist.items;
                if (!wishlistItems || !Array.isArray(wishlistItems)) {
                    console.error("Formato inesperado para wishlistItems:", wishlistItems);
                    return;
                }

                if (Array.isArray(wishlistItems)) {
                    const alreadyInWishlist = wishlistItems.some(item =>
                        item.product_id._id === productId && item.variant_id === variantId
                    );
        
                    if (alreadyInWishlist) {
                        console.log("El producto ya está en la wishlist.");
                        openWishlistModal('modalAlready_inWishlist');
                        return;
                    } else {
                        openWishlistModal('modalAdded_toWishlist');
                    }
                } else {
                    console.error("La respuesta de la wishlist no contiene un array válido:", wishlist);
                    throw new Error("Formato inesperado de la respuesta de la wishlist.");
                }
        
                // Si el producto no está en la wishlist, procede a agregarlo
                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                    method: 'POST',
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
                    throw new Error(errorData.message || 'Error al añadir a la wishlist');
                }
        
                openWishlistModal('modalAdded_toWishlist');
            } catch (error) {
                console.error('Error al procesar la solicitud de wishlist:', error);
                setErrorMessage('Ocurrió un error inesperado.');
            }
        };
        

        if (loading) return <div className="loading">Cargando productos...</div>;
        if (error) return <div className="error">Error al cargar productos: {error}</div>;

        

        return (
            <>
                <div className="imageProducts_Container">
                    <div className="container_ImageEffect">
                        <img src={WinterImage} alt="" />
                    </div>
                </div>
                <section className="productsPage">
                    <div className="heroSection">
                        <div className="heroImage"></div>
                    </div>
                    <div className="productsContainer">
                        <div className="productGrid">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div key={`${product._id}-${product.selectedVariant.variant_id}`} className="productItemWrapper">
                                        <div className="productImageWrapper">
                                            {/* <div className="overlayFade"></div> */}
                                            <NavLink
                                                to={`/products/${product._id}?variant_id=${product.selectedVariant.variant_id}`}
                                                className="productItem_ProductPage"
                                            >
                                                <img
                                                    src={product.selectedVariant.image
                                                        ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${product.selectedVariant.image.find(img => img.endsWith('.jpg') || img.endsWith('.png')) || product.selectedVariant.image[0]}`
                                                        : "ruta/a/imagen/por/defecto.jpg"}
                                                    alt={product.name || 'Producto sin nombre'}
                                                    className="productImage"
                                                />
                                            </NavLink>

                                            <button
                                                onClick={() => handleAddToWishlist(product._id, product.selectedVariant.variant_id)}
                                                className="likeIcon"
                                            >
                                                <span className="material-symbols-outlined">
                                                    favorite
                                                </span>
                                            </button>
                                        </div>

                                        <div className='containerInfo_productPage'>
                                            <h4 className='h4Products'>{product.name || 'Nombre no disponible'}</h4>
                                            <p className='pProducts'>${(product.price - product.discount).toFixed(2) || 'Precio no disponible'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No se encontraron productos.</p>
                            )}
                        </div>
                        {activeModal && <MultifunctionalModal />}
                    </div>
                </section>
            </>
        );
    };

    export default ProductsPage;
