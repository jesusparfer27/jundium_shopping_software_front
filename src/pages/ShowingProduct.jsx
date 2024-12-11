import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../components/modal-wishlist/ModalContext';
import { MultifunctionalModal } from '../components/modal-wishlist/MultifunctionalModal';
import '../css/pages/showing_product_page.css';

export const ShowingProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accordionOpen, setAccordionOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { activeModal, openModal } = useContext(ModalContext);

    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_PRODUCTS_ENDPOINT, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;

    const toggleAccordion = () => setAccordionOpen(!accordionOpen);

    const handleColorChange = (e) => {
        const selectedColor = e.target.value;
        
        // Encuentra la variante basada en el color seleccionado
        const variant = product?.variants.find(variant =>
            variant?.color?.colorName === selectedColor
        );
        
        if (variant) {
            console.log("Color seleccionado:", variant.color.colorName); // Log color cambiado
            setSelectedVariant(variant); // Actualiza la variante seleccionada
            setSelectedSize(""); // Reinicia el tamaño seleccionado si cambia el color
        } else {
            console.warn("No se encontró el color con el nombre:", selectedColor);
            setSelectedVariant(null);
        }
    };

    const handleSizeChange = (e) => {
        const selectedSize = e.target.value;
        setSelectedSize(selectedSize);

        if (selectedVariant) {
            const variant = product.variants.find(variant =>
                variant.sizes.size == selectedVariant.sizes.size,
                variant.color.colorName === selectedVariant.color.colorName
            );
            if (variant) {
                setSelectedVariant(variant);
                console.log(`Tamaño seleccionado: ${selectedSize}`); // Log del tamaño seleccionado
            } else {
                console.warn(`Tamaño no disponible para el color seleccionado y la talla ${selectedSize}`);
            }
        } else {
            console.warn('No hay una variante seleccionada previamente.');
        }
    };

    const getUserIdFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Por favor, inicia sesión para añadir productos al carrito.');
            openModal('modalNeed_toLogin');
            return;
        }

        if (!selectedSize) {
            openModal('modalSelectSize');
            return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            setErrorMessage('Error al extraer información del usuario.');
            return;
        }

        const productId = product?.id;
        const variantId = selectedVariant?.variant_id;
        const colorName = selectedVariant?.color?.colorName;

        if (!productId || !variantId || !colorName) {
            setErrorMessage('Por favor selecciona un color, tamaño y variante válidos antes de añadir al carrito.');
            console.error({
                productId,
                variantId,
                colorName,
                selectedSize,
            });
            return;
        }

        console.log("Producto seleccionado para añadir al carrito:", {
            productId,
            variantId,
            colorName: colorName,
            size: selectedSize,
        });

        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    variant_id: variantId,
                    colorName: colorName,
                    size: selectedSize,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al añadir al carrito');
            }

            const data = await response.json();
            console.log('Producto añadido al carrito:', data);
            openModal('modalAdded_toCart');
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            setErrorMessage('Ocurrió un error al añadir el producto al carrito.');
        }
    };


    useEffect(() => {
        if (id) {
            fetchProductById(id);
        }
    }, [id, VITE_API_BACKEND, VITE_BACKEND_ENDPOINT, VITE_PRODUCTS_ENDPOINT]);

    const fetchProductById = async (productId) => {
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}/${productId}`);
            if (!response.ok) throw new Error('Error al obtener el producto');

            const productData = await response.json();
            if (productData && productData._id) {
                productData.id = productData._id;
                productData.variants = productData.variants.map(variant => ({
                    ...variant,
                    product_id: productData.id,
                }));
                setProduct(productData);

                const params = new URLSearchParams(location.search);
                const variantIdFromUrl = params.get("variant_id");

                if (variantIdFromUrl) {
                    const variant = productData.variants.find(v => v.variant_id === variantIdFromUrl);
                    if (variant) {
                        setSelectedVariant(variant);
                        console.log("Variante inicial seleccionada:", variant.color.colorName); // Log variante inicial
                    } else {
                        console.warn("No se encontró una variante con el ID especificado.");
                    }
                } else {
                    const defaultVariant = productData.variants[0];
                    setSelectedVariant(defaultVariant);
                    if (defaultVariant) {
                        console.log("Variante inicial seleccionada:", defaultVariant.color.colorName); // Log variante inicial
                    }

                }
            }
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            setErrorMessage("Hubo un problema al cargar el producto. Inténtalo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando producto...</div>;
    if (!product) return <div>Producto no encontrado.</div>;

    const otherImages = selectedVariant?.image.slice(1) || [];

    return (
        <section className="productSection">
            <div className="imageContainer">
                {selectedVariant && selectedVariant.image.length > 0 ? (
                    <div className="productImage_ShowingPage">
                        {otherImages.map((image, index) => (
                            <img
                                key={index}
                                src={`${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${image}`}
                                alt={`${product.name} - ${selectedVariant.color.colorName}`}
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
                        <h2 className="h2_ShowingPage">{product.name}</h2>

                        <p className="paraphHidden_Accordion">
                            {selectedVariant ? selectedVariant.material : product.description}
                        </p>
                        <p>Precio: ${selectedVariant?.price || product.base_price}</p>

                        <button onClick={toggleAccordion} className="accordion">
                            {accordionOpen ? 'Ocultar materiales' : 'Mostrar materiales'}
                        </button>
                        {accordionOpen && selectedVariant && (
                            <div className="accordionContent">
                                <p>Materiales del producto: {selectedVariant.material}</p>
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
                                <option key={index} value={sizeObj.size} className="option_Size">
                                    {sizeObj.size}
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
                                    className="option_Color"
                                >
                                    {variant.color.colorName}
                                </option>
                            ))}
                        </select>

                        <button className="addToCart" onClick={handleAddToCart}>Añadir al carrito</button>
                    </div>
                </div>
                {activeModal && <MultifunctionalModal />}
            </div>
        </section>
    );
};

export default ShowingProductPage;
