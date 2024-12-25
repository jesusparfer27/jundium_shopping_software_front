import { createContext, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [generalProduct, setGeneralProduct] = useState({
        collection: "",
        brand: "",
        type: "",
        gender: "",
        new_arrival: true,
        featured: false,
    });

    const [variants, setVariants] = useState([{
        name: '',
        color: { colorName: '', hexCode: '' },
        sizes: [],
        material: '',
        price: '',
        discount: 0,
        image: [],
        showing_image: "",
        description: '',
    }]);

    return (
        <ProductContext.Provider value={{ generalProduct, setGeneralProduct, variants, setVariants }}>
            {children}
        </ProductContext.Provider>
    );
};