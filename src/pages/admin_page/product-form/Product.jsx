import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import '../../../css/pages/admin.css'

export const Product = () => {
    const { generalProduct, setGeneralProduct } = useContext(ProductContext);

    const [variants, setVariants] = useState([]);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [currentVariant, setCurrentVariant] = useState({});

    const navigate = useNavigate();
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

    const handleChange = (e) => {
        const { id, value } = e.target;
        console.log(`Cambiando ${id}: ${value}`);
        setGeneralProduct((prev) => ({
            ...prev,
            [id]: value,
        }));
    };
    

    useEffect(() => {
        const timer = setTimeout(() => {
            setGeneralProduct((prev) => ({ ...prev, new_arrival: false }));
        }, 7 * 24 * 60 * 60 * 1000);

        return () => clearTimeout(timer);
    }, []);

    const validateProductData = () => {
        if (!generalProduct.collection || !generalProduct.brand || !generalProduct.type || !generalProduct.gender) {
            console.error("Datos incompletos: Faltan algunos campos.");
            return false;
        }
        return true;
    };

    useEffect(() => {
        localStorage.setItem("generalProduct", JSON.stringify(generalProduct));
    }, [generalProduct]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateProductData()) return;

        const formData = new FormData();
        
        Object.keys(generalProduct).forEach((key) => {
            formData.append(key, generalProduct[key]);
        });


        try {
            const token = localStorage.getItem("authToken");

            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/create-product`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al crear el producto.");
            }

            const data = await response.json();
            console.log("Producto creado con éxito:", data);

            navigate("/admin");
        } catch (err) {
            console.error("Error en la creación del producto:", err);
        }
    };

    // useEffect(() => {
    //     if (variants.length === 0) {
    //         setVariants([{
    //             name: '',
    //             color: { colorName: '', hexCode: '' },
    //             size: [],
    //             material: '',
    //             price: '',
    //             discount: 0,
    //             image: [],
    //             showing_image: "",
    //             description: '',
    //         }]);
    //     }
    // }, []);
    
    useEffect(() => {
        if (variants.length > 0) {
            setCurrentVariant(variants[selectedVariantIndex]);
        }
    }, [selectedVariantIndex, variants]);

    return (
        <div className="createProductContainer">
            <div className="createProduct">
                <form onSubmit={handleSubmit}>
                    <div className="containerTittle_AdminContainer_Create">
                        <div className="containerTittle_AdminCreate">
                            <h1>Create a product</h1>
                        </div>
                    </div>
                    <div className="productForm">
                        <div className="divForm_ColumnContainer">
                            <div className="divForm_Column">
                                <label htmlFor="gender" className="labelTypeOfProduct">Gender</label>
                                <select
                                    id="gender"
                                    value={generalProduct.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="mujer">mujer</option>
                                    <option value="hombre">hombre</option>
                                    <option value="unisex">unisex</option>
                                </select>
                            </div>

                            <div className="divForm_Column">
                                <label htmlFor="brand" className="labelTypeOfProduct">Brand</label>
                                <input
                                    type="text"
                                    id="brand"
                                    className="inputTypeOfProduct"
                                    placeholder="EXAMPLE: Nike"
                                    value={generalProduct.brand}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="divForm_Column">
                                <label htmlFor="collection" className="labelTypeOfProduct">Collection</label>
                                <input
                                    type="text"
                                    id="collection"
                                    className="inputTypeOfProduct"
                                    placeholder="EXAMPLE: Spring 2024"
                                    value={generalProduct.collection}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="divForm_Column">
                                <label htmlFor="type" className="labelTypeOfProduct">Tipo de Producto</label>
                                <select
                                    id="type"
                                    value={generalProduct.type}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Type</option>
                                    <option value="camiseta">camiseta</option>
                                    <option value="abrigo">abrigo</option>
                                    <option value="zapatillas">zapatillas</option>
                                    <option value="bolso">bolso</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};