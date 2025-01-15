import React, { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import "../../../css/pages/admin.css";

export const EditVariant = () => {
  const {
    variants,
    setVariants,
    addNewVariantForm,
    handleDeleteImageInput,
    handleShowImageUpload,
    handleImageUpload,
    handleOutOfStockChange,
    handleDeleteSize,
    productCode,
    setProductCode,
    calculateDiscountedPrice,
  } = useContext(ProductContext);

  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [stock, setStock] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [currentSize, setCurrentSize] = useState("");
  const [showImage, setShowImage] = useState("")

  const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

  useEffect(() => {
    localStorage.setItem("variants", JSON.stringify(variants));
  }, [variants]);

  const handleAddSize = (index) => {
    if (!currentSize.trim()) {
      alert("Por favor, ingrese una talla válida.");
      return;
    }

    if (stock <= 0) {
      alert("Por favor, ingrese un stock válido.");
      return;
    }

    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      if (!updatedVariants[index].sizes) {
        updatedVariants[index].sizes = [];
      }

      const exists = updatedVariants[index].sizes.some(
        (s) => s.size === currentSize
      );

      if (!exists) {
        updatedVariants[index].sizes.push({ size: currentSize, stock: stock });
      }

      return updatedVariants;
    });

    setCurrentSize("");
    setStock("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedVariants = variants.map((variant) => ({
      ...variant,
    }));

    try {
      console.log("Datos antes de enviar:", updatedVariants);

      for (let i = 0; i < updatedVariants.length; i++) {
        const variant = updatedVariants[i];

        if (variant.imageFiles?.length || variant.showing_image_file) {
          const formData = new FormData();

          variant.imageFiles.forEach((file) => formData.append("file", file));

          if (variant.showing_image_file) {
            formData.append("showing_image", variant.showing_image_file);
          }

          const uploadedImageUrls = await handleSaveImageUrlsToBackend(formData);

          variant.image = uploadedImageUrls.filter((url, index) => index < variant.imageFiles.length);
          variant.showing_image = uploadedImageUrls.find((url, index) => index === variant.imageFiles.length);

          delete variant.imageFiles;
          delete variant.showing_image_file;
        }

        console.log(`Esto es variant.image ${i + 1}, ${variant.image}`);
        console.log(`Esto es variant.showing_image ${i + 1}, ${variant.showing_image}`);
      }

      if (!productCode.trim()) {
        alert("Por favor, ingrese una referencia de producto válida.");
        return;
      }

      const url = `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/edit-variant-data/${productCode}`;
      console.log("URL de la solicitud:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ variants: updatedVariants }),
      });

      if (!response.ok) throw new Error("Error al actualizar la variante.");
      console.log("Variante actualizada con éxito.");
    } catch (error) {
      console.error("Error al actualizar la variante:", error);
    }
  };




  const handleVariantChange = (e, index) => {
    const { id, value } = e.target;

    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      const updatedVariant = updatedVariants[index];

      if (id.startsWith("color.") && updatedVariant.color) {
        updatedVariant.color[id.split('.')[1]] = value;
      } else if (id === "name" || id === "material") {
        updatedVariant[id] = value;
      } else {
        updatedVariant[id] = value;
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


  const handleSearchProductByCode = async () => {
    if (!productCode || typeof productCode !== "string" || !productCode.trim()) {
      alert("Por favor, ingrese una referencia de producto válida.");
      return;
    }

    const url = `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/product/by-reference?product_code=${productCode}`;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Producto no encontrado`);
      }

      const data = await response.json();

      if (data.variant) {
        console.log("Variante encontrada:", data.variant);
        setVariants([data.variant]);
      } else if (data.variants) {
        const filteredVariants = data.variants.filter(
          (variant) => variant.product_code === productCode
        );

        if (filteredVariants.length === 0) {
          alert("No se encontró ninguna variante con el código proporcionado.");
        } else {
          console.log("Variantes encontradas:", filteredVariants);
          setVariants(filteredVariants);
        }
      } else {
        alert("Datos inesperados recibidos del servidor.");
      }
    } catch (error) {
      console.error("Error al buscar producto por referencia:", error);
    }
  };

  const handleSaveImageUrlsToBackend = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(
        `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/upload-images/${productCode}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al subir imágenes");

      const data = await response.json();

      return data.imagePaths.map((path) => {
        const parts = path.split("\\");
        const fileName = parts[parts.length - 1];
        return `/${fileName}`;
      });
    } catch (error) {
      console.error("Error al guardar URLs de imágenes en el backend:", error);
      throw error;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="godDiv">
          <div
            className={`accordionContainer ${activeAccordion === "variant" ? "open" : ""
              }`}
          >
            {variants.map((variant, index) => (
              <div className="godSon" key={index}>
                <div className="createVariant_Container">
                  <div className="containerTittle_AdminContainer">
                    <div className="containerTittle_Admin">
                      <h2
                        className="text_createVariant"
                        onClick={() => setActiveAccordion("variant")}
                      >
                        Variante {index + 1}
                      </h2>
                    </div>
                  </div>

                  <div className="variant">
                    <div className="variantForm">
                      <div className="divForm_Column">
                        <label htmlFor="product_code" className="labelTypeOfProduct">
                          Referencia de la Variante
                        </label>
                        <input
                          type="text"
                          id="product_code"
                          className="inputTypeOfProduct"
                          placeholder="EXAMPLE: #REF-23911"
                          value={productCode}
                          onChange={(e) => setProductCode(e.target.value)}
                        />
                        <button type="button" className="submitCreateButton" onClick={handleSearchProductByCode}>
                          Buscar Producto
                        </button>
                      </div>
                      <div className="divForm_Column">
                        <div className="containerEdit_form">
                        </div>
                        <label htmlFor="colorName">Name:</label>
                        <input
                          name="name"
                          type="text"
                          id="name"
                          value={variant.name || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>

                      <div className="divForm_Column">
                        <label htmlFor="colorName">Color Name:</label>
                        <input
                          name="colorName"
                          type="text"
                          id="color.colorName"
                          value={variants[index]?.color?.colorName || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                      <div className="divForm_Column">
                        <label htmlFor="hexCode">Hex Code:</label>
                        <input
                          type="text"
                          id="color.hexCode"
                          value={variants[index]?.color?.hexCode || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                      <div className="divForm_Column">
                        <label htmlFor="material">Material:</label>
                        <input
                          name="material"
                          type="text"
                          id="material"
                          value={variants[index]?.material || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                      <div className="divForm_Column">
                        <div className="containerRow_forSize">
                          <div className="containerFor_inputSize">
                            <label htmlFor="size">Talla:</label>
                            <input
                              type="text"
                              id="size"
                              placeholder="Ej: M"
                              value={currentSize}
                              onChange={(e) =>
                                setCurrentSize(e.target.value.toUpperCase())
                              }
                            />
                          </div>

                          <div className="containerFor_inputSize">
                            <label htmlFor="stock">Stock:</label>
                            <input
                              type="number"
                              id="stock"
                              placeholder="Ej: 20"
                              value={stock}
                              onChange={(e) => {
                                const value = e.target.value;
                                setStock(value === "" ? "" : Math.max(0, parseInt(value, 10) || 0));
                              }}
                            />
                          </div>


                          <div className="containerFor_inputSize">
                            <div className="sizeContainer_Button">
                              <button
                                className="submitEditProductButton"
                                onClick={() => handleAddSize(index)}
                              >
                                Enviar talla
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="containerSize_Display">
                          <ul className="sizeDisplay">
                            {variants[index]?.sizes?.map((sizeObj, sizeIndex) => (
                              <li key={sizeIndex} className="sizeSelected_Group">
                                <div className="blockContainer_sizeDisplay">
                                  <p className="pSize_display">{`size: ${sizeObj.size}`}</p>
                                  <p className="pSize_display">{`en stock: ${sizeObj.stock}`}</p>
                                  <div className="containerRow_outStock">
                                    <label htmlFor={`outOfStock-${index}-${sizeIndex}`}>Fuera de stock</label>
                                    <input
                                      type="checkbox"
                                      id={`outOfStock-${index}-${sizeIndex}`}
                                      checked={sizeObj.outOfStock}
                                      onChange={(e) => handleOutOfStockChange(e, sizeIndex, index)}
                                    />
                                  </div>
                                </div>
                                <div className="buttonSize_container">
                                  <button
                                    className="deleteSize_Button"
                                    onClick={() =>
                                      handleDeleteSize(sizeObj.size, index)
                                    }
                                  >
                                    <span className="material-symbols-outlined">
                                      close
                                    </span>
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="divForm_Column">

                        <div className="introduceImageContainer">
                          <div className="introduceImage">
                            <label htmlFor={`image-${index}`} className="labelImage">
                              Subir Imágenes
                            </label>
                            <input
                              name="image"
                              type="file"
                              multiple
                              id={`image-${index}`}
                              className="inputImage"
                              onChange={(e) => handleImageUpload(e, index)}
                            />
                          </div>
                        </div>

                        <div className="containerForPreviews">
                          {variants[index]?.image?.length > 0 ? (
                            variants[index].image.map((imageUrl, imgIndex) => {

                              return (
                                <div key={imgIndex} className="imagePreview">
                                  <img
                                    src={`${VITE_API_BACKEND}/images${imageUrl}`}
                                    alt={`Preview ${imgIndex}`}
                                    className="previewImage"
                                  />
                                  <button
                                    className="deleteImage_Button"
                                    onClick={() => handleDeleteImageInput(index, imgIndex)}
                                  >
                                    <span className="material-symbols-outlined">close</span>
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="noImagePreview"></div>
                          )}
                        </div>


                        <div className="introduceImageContainer">
                          <div className="introduceImage">
                            <label htmlFor={`showing-image-${index}`} className="labelImage">
                              Imagen de Portada
                            </label>
                            <input
                              name="showing_image"
                              type="file"
                              id={`showing-image-${index}`}
                              className="inputImage"
                              onChange={(e) => handleShowImageUpload(e, index)}
                            />
                          </div>
                        </div>

                        <div className="containerForPreviews">
                          {variants[index]?.showing_image ? (
                            <div className="imagePreview">
                              <img
                                src={`${VITE_API_BACKEND}/images${variants[index].showing_image}`}
                                alt="Preview portada"
                                className="previewImage"
                              />
                              <button
                                className="deleteImage_Button"
                                onClick={() =>
                                  setVariants((prevVariants) => {
                                    const updatedVariants = [...prevVariants];
                                    updatedVariants[index].showing_image = "";
                                    return updatedVariants;
                                  })
                                }
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="noImagePreview">Sin imagen</div>
                          )}
                        </div>
                      </div>


                      <div className="divForm_Column">
                        <label htmlFor="price">Precio original:</label>
                        <input
                          type="number"
                          id="originalPrice"
                          value={variants[index]?.originalPrice || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                      <div className="divForm_Column">
                        <label htmlFor="price">Precio:</label>
                        <input
                          type="number"
                          id="price"
                          value={variants[index]?.price || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                      <div className="divForm_Column">
                        <label htmlFor="discount">Descuento:</label>
                        <input
                          name="discount"
                          type="number"
                          id="discount"
                          value={variants[index]?.discount || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                      <div className="divForm_Column">
                        <label htmlFor="description">Descripción:</label>
                        <textarea
                          id="description"
                          value={variants[index]?.description || ""}
                          onChange={(e) => handleVariantChange(e, index)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>

      <div className="container_ButtonSubmit">
        <div className="container_ButtonSubmitContainer">
          <div className="submitEdition">
            <button className="submitCreateButton" onClick={addNewVariantForm}>
              Agregar Nueva Variante
            </button>
          </div>
          <div className="submitEdition">
            <button
              className="submitCreateButton"
              onClick={(event) => {
                console.log("Selected Index:", selectedVariantIndex);
                handleSubmit(event, selectedVariantIndex);
              }}
            >
              Enviar Producto
            </button>
          </div>
        </div>
      </div>
    </>
  );
};