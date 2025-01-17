import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { MultifunctionalModal } from '../components/modal-wishlist/MultifunctionalModal';
import { WishlistContext } from '../context/WishlistContext';
import { ProductContext } from '../pages/admin_page/context/ProductContext'

import '../css/pages/product_page.css';

import WinterImage from '../assets/home-sections/winter-session-home.jpg';

// Componente principal que muestra los productos
export const ProductsPage = () => {
    // Uso de contextos para manejar modales y lógica de productos
    const { activeModal, openModal } = useContext(ModalContext);
    const { hasDiscount, renderPriceWithDiscount } = useContext(ProductContext);

    // Obtener parámetros de la URL
    const { id } = useParams();
    const { name } = useParams();

    // Estados locales para manejar los productos, carga y errores
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Contexto de la lista de deseos y variantes de productos
    const { handleAddToWishlist, selectedVariant, setSelectedVariant, product, setProduct } = useContext(WishlistContext);

    const { VITE_API_BACKEND, VITE_PRODUCTS_ENDPOINT, VITE_BACKEND_ENDPOINT, VITE_IMAGES_BASE_URL, VITE_IMAGE } = import.meta.env;

    // Obtención de parámetros de búsqueda en la URL
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const typeParam = searchParams.get('type'); // Filtro por tipo de producto
    const searchTerm = searchParams.get('search'); // Término de búsqueda
    const genderParam = searchParams.get('gender'); // Filtro por género
    const collectionParam = searchParams.get('collection'); // Filtro por colección
    const variantIdParam = searchParams.get('variant_id'); // Identificador de variante

    // Función para obtener los productos desde la API
    const fetchProducts = async () => {
        setLoading(true); // Activa el estado de carga
        setError(null); // Reinicia errores previos
    
        try {
            // Llamada a la API para obtener productos
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}`);
            if (!response.ok) throw new Error('Error al cargar los productos'); // Manejo de errores HTTP
            const data = await response.json();
    
            // Filtrar productos según los parámetros de búsqueda
            const filteredProducts = data.filter(product => {
                const genderMatch = !genderParam || product.gender === genderParam;
                const typeMatch = !typeParam || product.type === typeParam;
                const collectionMatch = !collectionParam || product.collection === collectionParam;
                // Filtra los productos por nombre de la variante
                const nameMatch = !searchTerm || product.variants.some(variant => 
                    variant.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                return genderMatch && typeMatch && collectionMatch && nameMatch;
            });
    
            // Asignar variantes seleccionadas a los productos filtrados
            const productsWithVariants = filteredProducts.flatMap(product =>
                product.variants.map(variant => ({
                    ...product,
                    selectedVariant: variant,
                    price: variant.price || product.base_price,
                    discount: variant.discount || product.discount,
                }))
            );
    
            setProducts(productsWithVariants); // Actualiza el estado con los productos filtrados
        } catch (err) {
            setError(err.message); // Captura y guarda el error
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };

    // Ejecutar la obtención de productos al montar el componente o al cambiar los filtros
    useEffect(() => {
        fetchProducts();
    }, [searchTerm, typeParam, genderParam, collectionParam]);

    // Redirige a una URL específica cuando se selecciona una variante
    const handleVariantSelect = (productId, variantId) => {
        window.location.href = `/products/${productId}?variant_id=${variantId}`;
    };

    // Renderizado condicional durante la carga o en caso de error
    if (loading) return <div className="loading">Cargando productos...</div>;
    if (error) return <div className="error">Error al cargar productos: {error}</div>;

    // Renderizado principal del componente
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
                                        <NavLink
                                            to={`/products/${product._id}?variant_id=${product.selectedVariant.variant_id}`}
                                            className="productItem_ProductPage"
                                        >
                                            <img
                                                src={product.selectedVariant?.showing_image
                                                    ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${selectedVariant?.showing_image.find(
                                                        (img) => img.endsWith('.jpg') || img.endsWith('.png')
                                                    ) || product.selectedVariant?.showing_image}`
                                                    : "ruta/a/imagen/por/defecto.jpg"
                                                }
                                                alt={product.selectedVariant?.name || 'Producto sin nombre'}
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

                                    <div className="containerInfo_productPage">
                                        <h4 className="h4Products">{product.selectedVariant?.name || 'Nombre no disponible'}</h4>

                                        {/* Renderizado del precio con o sin descuento */}
                                        <div className="priceContainer_productPage">
                                            {renderPriceWithDiscount(product.selectedVariant)}
                                        </div>
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
