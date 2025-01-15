import { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import '../../../css/pages/admin.css'

export const Product = () => {
    const { generalProduct, setGeneralProduct } = useContext(ProductContext);

    const handleChange = (e) => {
        const { id, value } = e.target;
        console.log(`Cambiando ${id}: ${value}`);
        setGeneralProduct((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    useEffect(() => {
        localStorage.setItem("generalProduct", JSON.stringify(generalProduct));
    }, [generalProduct]);

    return (
        <div className="createProductContainer">
            <div className="createProduct">
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
            </div>
        </div>
    );
};