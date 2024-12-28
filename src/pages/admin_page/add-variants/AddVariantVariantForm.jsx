import React, { useState, useEffect, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import "../../../css/pages/admin.css";

export const AddVariantVariantForm = () => {
  const { generalProduct, variants, setVariants } = useContext(ProductContext);

  const [sizes, setSizes] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [error, setError] = useState("");
  const [variantCount, setVariantCount] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [stock, setStock] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [currentSize, setCurrentSize] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [showImage, setShowImage] = useState("")
  const [currentVariant, setCurrentVariant] = useState({
    name: "",
    color: { colorName: "", hexCode: "" },
    sizes: [],
    material: "",
    price: "",
    discount: 0,
    image: [],
    showing_image: [],
    description: "",
  });
  const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

  useEffect(() => {
    localStorage.setItem("variants", JSON.stringify(variants));
  }, [variants]);

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

  useEffect(() => {
    if (!variants || variants.length === 0) {
      setVariants([
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
    }
  }, []);

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

  const handleDeleteSize = (sizeToRemove, index) => {
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants[index].sizes = updatedVariants[index].sizes.filter(
        (s) => s.size !== sizeToRemove
      );
      return updatedVariants;
    });
  };

  const generateProductCode = () => {
    const code =
      "PROD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    console.log("Generated Product Code:", code);
    return code;
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



  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!validateData()) return;

    const updatedVariants = variants.map((variant) => ({
      ...variant,
      product_code: generateProductCode(),
    }));

    try {
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

        console.log(`Esto es variant.image ${i + 1}, ${variant.image}`)
        console.log(`Esto es variant.showing_image ${i + 1}, ${variant.showing_image}`)
      }


      const formData = new FormData();
      formData.append("generalProduct", JSON.stringify(generalProduct));
      formData.append("variants", JSON.stringify(updatedVariants));

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }


      const response = await fetch(
        `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/add-variant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );


      if (!response.ok) throw new Error("Error al crear el producto.");
      console.log("Producto creado con éxito.");
    } catch (error) {
      console.error("Error al enviar el producto:", error);
    }
  };

  const handleDeleteImageInput = (variantIndex, imageIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].image = updatedVariants[
      variantIndex
    ].image.filter((_, idx) => idx !== imageIndex);
    setVariants(updatedVariants);
  };
  

  const handleSaveImageUrlsToBackend = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(
        `${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/upload-images`,
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

  const validateData = () => {
    for (const variant of variants) {
      if (!variant.name || !variant.price) {
        console.error("Faltan datos de una variante.");
        return false;
      }
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
                            {variants[index]?.sizes?.map((sizeObj, idx) => (
                              <li key={idx} className="sizeSelected_Group">
                                <div className="blockContainer_sizeDisplay">
                                  <p className="pSize_display">{`size: ${sizeObj.size}`}</p>
                                  <p className="pSize_display">{`en stock: ${sizeObj.stock}`}</p>
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