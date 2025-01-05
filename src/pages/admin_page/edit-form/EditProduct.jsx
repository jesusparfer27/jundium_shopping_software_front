import { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import '../../../css/pages/admin.css'

export const EditProduct = () => {
    const { generalProduct, setGeneralProduct, productReference, setProductReference } = useContext(ProductContext);
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env; 

    const handleChange = (e) => {
        const { id, value } = e.target;
    
        if (id === "product_reference") {
            setProductReference(value); // Solo actualiza el estado de referencia si el ID es "product_reference"
        } else {
            setGeneralProduct((prev) => ({
                ...prev,
                [id]: value, // Actualiza únicamente el campo correspondiente en generalProduct
            }));
        }
    };
    

    useEffect(() => {
        localStorage.setItem("generalProduct", JSON.stringify(generalProduct));
    }, [generalProduct]);


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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validación básica
        if (!productReference.trim()) {
            alert("Por favor, ingrese una referencia de producto válida.");
            return;
        }
    
        try {
            const response = await fetch(
                `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/edit-general-data/${productReference}`,
                {
                    method: "PUT", // Cambiamos a PUT para actualizaciones
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(generalProduct), // Enviamos el producto como JSON
                }
            );
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo actualizar el producto.`);
            }
    
            const updatedProduct = await response.json();
            console.log("Producto actualizado con éxito:", updatedProduct);
            alert("Producto actualizado con éxito.");
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            alert("Error al actualizar el producto.");
        }
    };
    

    return (
        <div className="createProductContainer">
            <div className="createProduct">

                <div className="containerTittle_AdminContainer_Create">
                    <div className="containerTittle_AdminCreate">
                        <h1>Editar los datos generales del producto</h1>
                    </div>
                </div>
                <form>
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
                                <button type="button" className="submitCreateButton" onClick={handleSearchProductByReference}>Buscar Producto</button>
                            </div>
                        </div>
                    </div>
                </form>
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
                            <div className="submitEdition">
                                <button
                                    className="submitCreateButton"
                                    onClick={handleSubmit}>
                                    Agregar cambios
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
