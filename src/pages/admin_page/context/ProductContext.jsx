import { createContext, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [productReference, setProductReference] = useState("");
  const [productCode, setProductCode] = useState("")

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
    originalPrice: '',
    discount: 0,
    image: [],
    showing_image: [],
    description: '',
  }]);

  // Función para restablecer el estado a los valores iniciales
  const resetProductState = () => {
    setProductReference("");
    setProductCode("");
    setGeneralProduct({
      collection: "",
      brand: "",
      type: "",
      gender: "",
      new_arrival: true,
      featured: false,
    });
    setVariants([
      {
        name: "",
        color: { colorName: "", hexCode: "" },
        sizes: [],
        material: "",
        price: "",
        originalPrice: "",
        discount: 0,
        image: [],
        showing_image: [],
        description: "",
      },
    ]);
  };

  const calculateDiscountedPrice = (originalPrice, discount) => {
    if (!originalPrice || !discount) return "0.00"; // Retorna como cadena para consistencia
    const discountedPrice = originalPrice - (originalPrice * discount) / 100;
    return discountedPrice.toFixed(2); // Mantiene siempre dos decimales como cadena
  };


  const validateData = () => {
    if (!generalProduct.collection || !generalProduct.brand) {
      console.error("Faltan datos del producto.");
      return false;
    }
    for (const variant of variants) {
      if (!variant.name || !variant.price || !variant.originalPrice) {
        console.error("Faltan datos de una variante.");
        return false;
      }
    }
    return true;
  };

  const handleOutOfStockChange = (e, sizeIndex, variantIndex) => {
    const { checked } = e.target;

    // Actualizamos el estado para reflejar el cambio en outOfStock
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      const updatedSizes = [...updatedVariants[variantIndex].sizes];

      // Establecemos el valor de outOfStock en el índice correspondiente
      updatedSizes[sizeIndex] = {
        ...updatedSizes[sizeIndex],
        out_of_stock: checked // Aquí se actualiza el valor
      };

      updatedVariants[variantIndex].sizes = updatedSizes;

      return updatedVariants;
    });
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
        originalPrice: '',
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
      const updatedVariant = updatedVariants[index];

      // Actualización directa de las propiedades del variant
      if (id.startsWith("color.")) {
        // Actualizamos las propiedades dentro de "color"
        const colorKey = id.split(".")[1]; // Extraemos "colorName" o "hexCode"
        updatedVariant.color = {
          ...updatedVariant.color, // Mantenemos el resto de propiedades
          [colorKey]: value, // Actualizamos solo la propiedad cambiada
        };
      } else {
        updatedVariant[id] = value; // Actualizamos el campo directo
      }

      // Actualización de precio con base en "originalPrice" y "discount"
      if (id === "originalPrice") {
        updatedVariant.price = value;
      }
      if (id === "discount") {
        const discountValue = parseFloat(value);
        if (discountValue > 0) {
          updatedVariant.price = calculateDiscountedPrice(updatedVariant.originalPrice, discountValue);
        } else {
          updatedVariant.price = updatedVariant.originalPrice;
        }
      }

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

  // Nueva función para verificar descuentos
  const hasDiscount = () => {
    return variants.some((variant) => variant.discount > 0);
  };

  // Nueva función para renderizar precios con descuento
  const renderPriceWithDiscount = (variant) => {
    if (variant.discount > 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              textDecoration: "line-through",
              color: "darkgray",
              fontSize: "0.9rem",
            }}
          >
            ${variant.originalPrice}
          </span>
          <span style={{ color: "black", fontWeight: "bold" }}>
            ${variant.price}
          </span>
          <span style={{ color: "red", fontSize: "0.8rem" }}>
            -{variant.discount}%
          </span>
        </div>
      );
    } else {
      return (
        <span style={{ color: "black", fontWeight: "bold" }}>
          ${variant.price}
        </span>
      );
    }
  };

  const handleDeleteVariant = (variantId) => {
    setVariants((prevVariants) => {
      const updatedVariants = prevVariants.filter((variant) => variant.id !== variantId);
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
      productReference, setProductReference,
      productCode, setProductCode,
      handleOutOfStockChange,
      calculateDiscountedPrice,
      hasDiscount,
      renderPriceWithDiscount,
      resetProductState,
      handleDeleteVariant
    }}>
      {children}
    </ProductContext.Provider>
  );
};