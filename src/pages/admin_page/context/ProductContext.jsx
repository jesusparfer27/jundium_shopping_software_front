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
        showing_image: [],
        description: '',
    }]);

    const validateData = () => {
        if (!generalProduct.collection || !generalProduct.brand) {
          console.error("Faltan datos del producto.");
          return false;
        }
        for (const variant of variants) {
          if (!variant.name || !variant.price) {
            console.error("Faltan datos de una variante.");
            return false;
          }
        }
        return true;
      };

      const addNewVariantForm = () => {
        setVariants((prevVariants) => [
          ...prevVariants,
          {
            name: "",
            color: { colorName: "", hexCode: "" },
            sizes: [],
            material: "",
            price: "",
            discount: 0,
            image: [],
            showing_image: [],
            description: "",
          },
        ]);
      };

    return (
        <ProductContext.Provider value={{ generalProduct, setGeneralProduct, variants, setVariants, validateData, addNewVariantForm }}>
            {children}
        </ProductContext.Provider>
    );
};