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

    const handleDeleteImageInput = (variantIndex, imageIndex) => {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex].image = updatedVariants[
            variantIndex
        ].image.filter((_, idx) => idx !== imageIndex);
        setVariants(updatedVariants);
    };

    const handleShowImageUpload = (e, index) => {
        const file = e.target.files[0];
        console.log(`Esto es file en handleShowImageUpload ${index + 1}, ${file}`)


        if (file) {
            const blobUrl = URL.createObjectURL(file);

            setVariants((prevVariants) => {
                const updatedVariants = [...prevVariants];
                updatedVariants[index].showing_image_file = file;
                updatedVariants[index].showing_image = blobUrl;
                return updatedVariants;
            });
        }
    };

    const handleImageUpload = (e, index) => {
        const files = Array.from(e.target.files);
        console.log(`esto son los files de handleImageUpload", ${index + 1}, ${files}`)



        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[index].imageFiles = files;

            const blobUrls = files.map((file) => URL.createObjectURL(file));
            updatedVariants[index].image = blobUrls;

            return updatedVariants;
        });
    };

      const generateProductReference = () => {
    const code =
      "PROD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    console.log("Generated Product Code:", code);
    return code;
  };

  const generateProductCode = () => {
    const code =
      "PROD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    console.log("Generated Product Code:", code);
    return code;
  };

  const handleVariantChange = (e, index) => {
    const { id, value } = e.target;
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      const variant = updatedVariants[index];

      if (id === "name") {
        variant.name = value;
      } else {
        if (id.includes(".")) {
          const [parentKey, childKey] = id.split(".");
          variant[parentKey] = {
            ...variant[parentKey],
            [childKey]: value,
          };
        } else {
          variant[id] = value;
        }
      }

      updatedVariants[index] = variant;
      return updatedVariants;
    });
  };

  const handleDeleteSize = (sizeToRemove, index) => {
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants[index].sizes = updatedVariants[index].sizes.filter(
        (s) => s.size !== sizeToRemove
      );
      return updatedVariants;
    });
  };

    return (
        <ProductContext.Provider value={{
            generalProduct,
            setGeneralProduct,
            variants,
            setVariants,
            validateData,
            addNewVariantForm,
            handleDeleteImageInput,
            handleShowImageUpload,
            handleImageUpload,
            generateProductReference,
            generateProductCode,
            handleVariantChange,
            handleDeleteSize,
        }}>
            {children}
        </ProductContext.Provider>
    );
};