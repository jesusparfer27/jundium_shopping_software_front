import React, { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import "../../../css/pages/admin.css";

export const AddVariantVariantForm = () => {
  // Extrae valores y funciones del contexto para manejar variantes del producto
  const {
    productReference,
    setProductReference,
    variants,
    setVariants,
    validateData,
    addNewVariantForm,
    handleDeleteImageInput,
    handleShowImageUpload,
    handleImageUpload,
    generateProductCode,
    handleVariantChange,
    handleDeleteSize,
    handleOutOfStockChange,
    handleDeleteVariant
  } = useContext(ProductContext);

  // Estados locales para manejar tallas, errores, índice de variante seleccionada, etc.
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [stock, setStock] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [currentSize, setCurrentSize] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [showImage, setShowImage] = useState("")
  const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

  // Guarda las variantes en localStorage cada vez que se actualizan.
  useEffect(() => {
    localStorage.setItem("variants", JSON.stringify(variants));
  }, [variants]);

  // Agrega una nueva talla y su stock a una variante específica.
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

    // Limpia los campos después de agregar la talla
    setCurrentSize("");
    setStock("");
  };


  // Envía los datos del formulario al backend y maneja la carga de imágenes.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valida los datos antes de enviar
    if (!validateData()) return;

    const updatedVariants = variants.map((variant) => ({
      ...variant,
      product_code: generateProductCode(),
      originalPrice: variant.originalPrice || variant.price,
    }));

    try {
      // Procesa cada variante y maneja la subida de imágenes
      for (let i = 0; i < updatedVariants.length; i++) {
        const variant = updatedVariants[i];

        console.log("Datos de la variante antes de enviar:", variant);

        // Si hay imágenes, las sube al backend
        if (variant.imageFiles?.length || variant.showing_image_file) {
          console.log('Imágenes a agregar:', variant.imageFiles);
          console.log('Imagen de portada a agregar:', variant.showing_image_file);

          const formData = new FormData();
          formData.append("imageFolders", JSON.stringify(["public", "images"]));

          variant.imageFiles.forEach((file) => {
            console.log('Archivo agregado al formData:', file);
            formData.append("file", file);
          });

          if (variant.showing_image_file) {
            console.log('Imagen de portada agregada al formData:', variant.showing_image_file);
            formData.append("showing_image", variant.showing_image_file);
          }

          for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
          }

          const uploadedImageUrls = await handleSaveImageUrlsToBackend(formData);

          // Actualiza las URLs de las imágenes en la variante
          variant.image = uploadedImageUrls.filter((url, index) => index < variant.imageFiles.length);
          variant.showing_image = uploadedImageUrls.find((url, index) => index === variant.imageFiles.length);

          delete variant.imageFiles;
          delete variant.showing_image_file;
        }


        console.log(`Esto es variant.image ${i + 1}`, variant.image);
        console.log(`Esto es variant.showing_image ${i + 1}`, variant.showing_image);
      }

      // Envía las variantes actualizadas al backend
      const formData = new FormData();
      formData.append("variants", JSON.stringify(updatedVariants));

      console.log('updatedVariants:', updatedVariants);

      const response = await fetch(
        `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/add-variant/${productReference}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      console.log("esto es productReference", productReference)

      if (!response.ok) throw new Error("Error al crear el producto.");
      console.log("Producto creado con éxito.");

    } catch (error) {
      console.error("Error al enviar el producto:", error);
    }
  };

  // Carga las variantes guardadas desde localStorage al montar el componente.
  useEffect(() => {
    const storedVariants = localStorage.getItem("variants");
    if (storedVariants) {
      setVariants(JSON.parse(storedVariants));
    }
  }, []);

  // Envía imágenes al backend y devuelve sus URLs.
  const handleSaveImageUrlsToBackend = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(
        `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/upload-images/to-product`,
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

      // Retorna las rutas procesadas de las imágenes
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
                            variants[index].image.map((imageUrl, imgIndex) => (
                              <div key={imgIndex} className="imagePreview">
                                <img
                                  src={imageUrl}
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
                            ))
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
                                src={variants[index].showing_image}
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
            <button
              className="submitCreateButton"
              onClick={handleDeleteVariant}
            > Eliminar Variantes
            </button>
          </div>
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