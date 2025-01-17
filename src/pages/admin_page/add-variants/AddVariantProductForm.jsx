import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import '../../../css/pages/admin.css'

export const AddVariantProductForm = () => {
    // Obtiene valores del contexto ProductContext
    const { generalProduct, setGeneralProduct, productReference, setProductReference } = useContext(ProductContext);

    // Estados locales para manejar variantes y el producto seleccionado
    const [variants, setVariants] = useState([]);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [currentVariant, setCurrentVariant] = useState({});

    const navigate = useNavigate(); // Hook para navegación
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

    // Función para buscar un producto por su referencia
    const handleSearchProductByReference = async () => {
        if (!productReference.trim()) {
            alert("Por favor, ingrese una referencia de producto válida.");
            return;
        }
        
        const url = `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/product/by-reference?product_reference=${productReference}`;
    
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: Producto no encontrado`);
            }
    
            const data = await response.json();
            console.log("Producto encontrado:", data);
            setGeneralProduct(data); // Actualiza el estado con el producto encontrado
        } catch (error) {
            console.error("Error al buscar producto por referencia:", error);
        }
    };
    
    // Función para manejar cambios en el campo de referencia del producto
    const handleChange = (e) => {
        setProductReference(e.target.value);
    };

    // Efecto para guardar el producto general en el localStorage cuando cambia
    useEffect(() => {
        localStorage.setItem("generalProduct", JSON.stringify(generalProduct));
    }, [generalProduct]);

    // Función para manejar el envío del formulario de añadir variantes
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Añade todos los datos del producto general al formulario
        Object.keys(generalProduct).forEach((key) => {
            formData.append(key, generalProduct[key]);
        });


        try {
            const token = localStorage.getItem("authToken");

            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/add-variant/${productReference}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al crear el producto.");
            }

            const data = await response.json(); // Parseo de la respuesta
            console.log("Producto creado con éxito:", data);

            navigate("/admin"); // Redirige a la página de administración
        } catch (err) {
            console.error("Error en la creación del producto:", err);
        }
    };
    
    // Efecto para actualizar el producto actual basado en la variante seleccionada
    useEffect(() => {
        if (variants.length > 0) {
            setCurrentVariant(variants[selectedVariantIndex]);
        }
    }, [selectedVariantIndex, variants]);

    return (
        <div className="createProductContainer">
            <div className="createProduct">
                <form  onSubmit={handleSubmit}>
                    <div className="containerTittle_AdminContainer_Create">
                        <div className="containerTittle_AdminCreate">
                            <h1>Añadir Variantes</h1>
                        </div>
                    </div>
                    <div className="productForm">
                        <div className="divForm_ColumnContainer">
                            <div className="divForm_Column">
                                <label htmlFor="product_reference" className="labelTypeOfProduct">Referencia del Producto</label>
                                <input
                                    type="text"
                                    id="product_reference"
                                    className="inputTypeOfProduct"
                                    placeholder="EXAMPLE: #REF-23911"
                                    value={productReference}
                                    onChange={handleChange}
                                />
                                <button className="submitCreateButton" onClick={handleSearchProductByReference}>Buscar Producto</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};