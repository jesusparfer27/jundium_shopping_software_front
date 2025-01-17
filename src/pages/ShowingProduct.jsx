import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { MultifunctionalModal } from '../components/modal-wishlist/MultifunctionalModal';
import { ProductContext } from './admin_page/context/ProductContext';
import { useUser } from '../hooks/useUser';
import '../css/pages/showing_product_page.css';

// Componente para mostrar los detalles de un producto seleccionado
export const ShowingProductPage = () => {
    const { id } = useParams(); // Obtiene el ID del producto desde la URL
    const { user } = useUser(); // Obtiene los datos del usuario actual
    const [accordionOpen, setAccordionOpen] = useState(false); // Controla el estado del acordeón de materiales
    const [lowStockWarning, setLowStockWarning] = useState(false); // Muestra advertencias sobre bajo stock
    const { hasDiscount, renderPriceWithDiscount } = useContext(ProductContext); // Utilidades para descuentos
    const { loading,
        setErrorMessage,
        errorMessage,
        handleAddToCart,
        selectedSize,
        setSelectedSize,
        selectedVariant,
        setSelectedVariant,
        setLoading,
        product,
        setProduct
    } = useContext(CartContext); // Contexto del carrito
    const { activeModal } = useContext(ModalContext); // Contexto del modal activo

    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_PRODUCTS_ENDPOINT, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;

    // Alterna el estado del acordeón para mostrar/ocultar materiales
    const toggleAccordion = () => setAccordionOpen(!accordionOpen);

    // Maneja el cambio de color seleccionado y actualiza la variante
    const handleColorChange = (e) => {
        const selectedColor = e.target.value;

        const variant = product?.variants.find(variant =>
            variant?.color?.colorName === selectedColor
        );

        console.log("Colores disponibles:", product?.variants.map(v => v.color.colorName));
        console.log("Color seleccionado:", selectedColor);

        if (variant) {
            setSelectedVariant(variant);
            console.log("Color seleccionado:", variant.color.colorName);
        } else {
            console.warn("No se encontró el color con el nombre:", selectedColor);
            setSelectedVariant(null);
        }
        setSelectedSize(""); // Reinicia la talla seleccionada
    };

    // Fetch para obtener los detalles del producto por su ID
    const fetchProductById = async (productId) => {
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}/${productId}`);
            if (!response.ok) throw new Error('Error al obtener el producto');

            const productData = await response.json();

            if (productData && productData._id) { 
                productData.id = productData._id; // Ajusta el ID del producto
                productData.variants = productData.variants.map(variant => ({
                    ...variant,
                    product_id: productData.id,
                }));
                setProduct(productData);

                console.log('Producto cargado:', productData);
                console.log('Variantes cargadas:', productData.variants);

                // Configura la variante inicial desde la URL o elige la primera
                const params = new URLSearchParams(location.search);
                const variantIdFromUrl = params.get("variant_id");
                console.log("Variant ID from URL:", variantIdFromUrl);


                if (variantIdFromUrl) {
                    const variant = productData.variants.find(v => v.variant_id === variantIdFromUrl);
                    console.log('Variante seleccionada:', variant);
                    if (variant) {
                        setSelectedVariant(variant);
                        console.log("Variante inicial seleccionada:", variant.color.colorName);
                    } else {
                        console.warn("No se encontró una variante con el ID especificado.");
                    }
                } else {
                    const defaultVariant = productData.variants[0];
                    setSelectedVariant(defaultVariant);
                    if (defaultVariant) {
                        console.log("Variante inicial seleccionada:", defaultVariant.color.colorName);
                    }
                }
            }
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            setErrorMessage("Hubo un problema al cargar el producto. Inténtalo más tarde.");
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };

    // Hook para obtener el producto cuando cambia el ID
    useEffect(() => {
        if (id) {
            fetchProductById(id);
        }
    }, [id, VITE_API_BACKEND, VITE_BACKEND_ENDPOINT, VITE_PRODUCTS_ENDPOINT]);

    // Maneja el cambio de tamaño seleccionado y actualiza la variante
    const handleSizeChange = (e) => {
        const selectedSize = e.target.value;
        setSelectedSize(selectedSize);

        if (selectedVariant && product && product.variants) {
            const variant = product.variants.find(variant =>
                variant.sizes.some(size => size.size === selectedSize) &&
                variant.color.colorName === selectedVariant.color.colorName
            );

            if (variant) {
                setSelectedVariant(variant);
                // Comprobación de stock bajo
                const sizeObj = variant.sizes.find(size => size.size === selectedSize);
                if (sizeObj && sizeObj.stock < 5) {
                    setLowStockWarning(true);
                } else {
                    setLowStockWarning(false);
                }
            }
        }
    };

    // Mostrar mensaje de carga o producto no encontrado
    if (loading) return <div>Cargando producto...</div>;
    if (!product) return <div>Producto no encontrado.</div>;

    const otherImages = selectedVariant?.image || [];
    const hasDiscountApplied = selectedVariant?.discount > 0;
    const variantPrice = selectedVariant?.price || 0;
    const priceToDisplay = renderPriceWithDiscount(selectedVariant);

    // Verificar permisos del usuario
    const hasFullPermissions = user?.permissions && Object.values(user.permissions).every(value => value === true);


    return (
        <section className="productSection">
            <div className="imageContainer">
                {selectedVariant && selectedVariant.image.length > 0 ? (
                    <div className="productImage_ShowingPage">
                        {otherImages.map((image, index) => (
                            <img
                                key={index}
                                src={`${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${image}`}
                                alt={`${selectedVariant?.name} - ${selectedVariant.color.colorName}`}
                                className="otherProductImage"
                                onError={(e) => (e.target.src = 'ruta/a/imagen/por/defecto.jpg')}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="productImage">
                        <img src="ruta/a/imagen/por/defecto.jpg" alt="Imagen por defecto" />
                    </div>
                )}
            </div>

            <div className="infoProduct_Container">
                <div className="infoProduct_ShowingProduct">
                    <div className="infoProduct_Row">
                        <h2 className="h2_ShowingPage">{selectedVariant?.name}</h2>
                        {/* Mostrar solo si el usuario tiene permisos completos */}
                        {hasFullPermissions && (
                            <>
                                <p>Product Reference: {selectedVariant?.product_code}</p>
                                <p>Product Code: {product?.product_reference}</p>
                            </>
                        )}
                        <p className="paraphHidden_Accordion">
                            {selectedVariant?.description}
                        </p>
                        {hasDiscountApplied ? (
                            <>
                                <p className="textCard_HeaderProduct discountedPriceProduct">
                                    {priceToDisplay}
                                </p>
                            </>
                        ) : (
                            <p className="textCard_Header">${variantPrice.toFixed(2)}</p>
                        )}

                        <button onClick={toggleAccordion} className="accordion">
                            {accordionOpen ? 'Ocultar materiales' : 'Mostrar materiales'}
                        </button>
                        {accordionOpen && selectedVariant && (
                            <div className="accordionContent">
                                <p>{selectedVariant.material}</p>
                            </div>
                        )}

                        <br />
                        <label htmlFor="size" className="label_Size">Tamaño:</label>
                        <select
                            id="size"
                            className="select_Size"
                            value={selectedSize}
                            onChange={handleSizeChange}
                        >
                            <option value="">Seleccionar Talla</option>
                            {selectedVariant?.sizes.map((sizeObj, index) => (
                                <option
                                    key={index}
                                    value={sizeObj.size}
                                    className={`option_Size ${sizeObj.stock === 0 ? 'outOfStock' : ''}`}
                                    disabled={sizeObj.stock === 0}
                                >
                                    {sizeObj.size} {sizeObj.stock === 0 ? '(Agotado)' : ''}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="color" className="label_Color">Color:</label>
                        <select
                            id="color"
                            className="select_Color"
                            value={selectedVariant?.color?.colorName || ""}
                            onChange={handleColorChange}
                        >
                            <option value="">Seleccionar Color</option>
                            {product?.variants?.map((variant, index) => (
                                <option
                                    key={index}
                                    value={variant.color.colorName}
                                    className={`option_Color ${variant.stock === 0 ? 'outOfStock' : ''}`}
                                    disabled={variant.stock === 0}
                                >
                                    {variant.color.colorName} {variant.stock === 0 ? '(Agotado)' : ''}
                                </option>
                            ))}
                        </select>


                        {/* Mostrar aviso de stock bajo */}
                        <p className={`lowStockWarning ${lowStockWarning ? 'visible' : 'hidden'}`}>
                            ¡Quedan pocas unidades en stock!
                        </p>

                        <button
                            className="addToCart"
                            onClick={handleAddToCart}
                        >
                            Añadir al carrito
                        </button>
                    </div>
                </div>
                {activeModal && <MultifunctionalModal />}
            </div>
        </section>
    );
};

export default ShowingProductPage;