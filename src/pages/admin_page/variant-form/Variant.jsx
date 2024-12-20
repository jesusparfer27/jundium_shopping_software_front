import React, { useState, useEffect, useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import '../../../css/pages/admin.css'

export const Variant = () => {
    const { generalProduct, variants, setVariants } = useContext(ProductContext);

    const [sizes, setSizes] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    const [error, setError] = useState('');
    const [variantCount, setVariantCount] = useState(0);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [currentSize, setCurrentSize] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [currentVariant, setCurrentVariant] = useState({
        name: '',
        color: { colorName: '', hexCode: '' },
        sizes: [{ size: '', stock: 0 }],
        file: [],
        material: '',
        price: '',
        discount: 0,
        image: [],
        is_main: false,
        description: '',
    });
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

    useEffect(() => {
        localStorage.setItem("variants", JSON.stringify(variants));
    }, [variants]);


    const handleVariantChange = (e, index) => {
        const { id, value, checked } = e.target;
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            const variant = updatedVariants[index];

            if (id === 'name') {
                variant.name = value;
            } else if (id === 'is_main') {
                variant.is_main = checked;
            } else {
                if (id.includes('.')) {
                    const [parentKey, childKey] = id.split('.');
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


    const handleAddImageInput = (index) => {
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            if (!Array.isArray(updatedVariants[index].image)) {
                updatedVariants[index].image = [];
            }
            if (updatedVariants[index].image[updatedVariants[index].image.length - 1] === '') {
                return updatedVariants;
            }
            updatedVariants[index].image.push('');
            return updatedVariants;
        });
    };

    const handleImageUploadChange = (e, index) => {
        const files = Array.from(e.target.files);
        console.log(`handleImageUploadChange - Index: ${index}, Files:`, files);
        const newUrls = files.map((file) => URL.createObjectURL(file));
        const newFileNames = files.map((file) => file.name);

        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            const variant = updatedVariants[index];

            if (!Array.isArray(variant.file)) {
                variant.file = [];
            }
            variant.image = [...new Set([...variant.image, ...newUrls])];
            variant.file = [...new Set([...variant.file, ...newFileNames])];

            console.log(`handleImageUploadChange - Index: ${index}, Updated Variants:`, updatedVariants);
            return updatedVariants;
        });
    };

    const handleImageChange = (e, index) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map((file) => URL.createObjectURL(file));

        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[index].image = imageUrls;
            return updatedVariants;
        });

        const fileNames = files.map((file) => file.name);
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[index].file = fileNames;
            return updatedVariants;
        });
    };


    useEffect(() => {
        if (variants.length === 0) {
            setVariants([
                {
                    name: '',
                    color: { colorName: '', hexCode: '' },
                    sizes: [{ size: '', stock: 0 }],
                    file: [],
                    material: '',
                    price: '',
                    discount: 0,
                    image: [],
                    is_main: false,
                    description: '',
                },
            ]);
        }
    }, []);

    const generateProductCode = () => {
        const code = 'PROD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        console.log('Generated Product Code:', code);
        return code;
    };


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

    const handleSelectVariant = (index) => {
        setSelectedVariantIndex(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateData()) return;

        const updatedVariants = variants.map((variant) => {
            const productCode = generateProductCode();
            if (!productCode) {
                console.error("El código del producto es nulo o vacío");
                return null;
            }
            return {
                ...variant,
                product_code: productCode,
            };
        });

        console.log("Datos de las variantes antes de enviar al backend:", updatedVariants);

        if (updatedVariants.includes(null)) return;

        const totalProducts = {
            ...generalProduct,
            variants: updatedVariants,
        };

        console.log("Productos enviados:", totalProducts);

        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/create-product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ generalProduct, variants: updatedVariants }),
            });

            if (!response.ok) throw new Error("Error al crear el producto.");
            console.log("Producto creado con éxito.");
        } catch (error) {
            console.error("Error al enviar el producto:", error);
        }
    };


    const handleSizeChange = (e, index, key) => {
        const value = key === 'size' ? e.target.value.toUpperCase() : e.target.value;
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            if (!updatedVariants[index].sizes) {
                updatedVariants[index].sizes = [];
            }

            const sizeIndex = updatedVariants[index].sizes.findIndex(
                (s) => s.size === (key === 'size' ? value : currentSize)
            );

            if (sizeIndex !== -1) {
                updatedVariants[index].sizes[sizeIndex][key] = value;
            } else if (key === 'size') {
                updatedVariants[index].sizes.push({ size: value, stock: 0 });
            }

            return updatedVariants;
        });
    };

    const handleAddSize = (index) => {
        if (!currentSize.trim()) {
            alert('Por favor, ingrese una talla válida.');
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
                updatedVariants[index].sizes.push({ size: currentSize, stock: 0 });
            }

            return updatedVariants;
        });

        setCurrentSize('');
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

    const handleStockChange = (e, index, size) => {
        const stockValue = parseInt(e.target.value, 10) || 0;
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            const sizeIndex = updatedVariants[index].sizes.findIndex(
                (s) => s.size === size
            );

            if (sizeIndex !== -1) {
                updatedVariants[index].sizes[sizeIndex].stock = stockValue;
            }

            return updatedVariants;
        });
    };


    const generateImageFolderPath = (product, variant) => {
        const type = product?.type || 'unknownType';
        const gender = product?.gender || 'unknownGender';
        const name = variant?.name || 'unknownProduct';
        const colorName = variant?.color?.colorName || 'unknownColor';
        return `${gender}/${type}/${name}/${colorName}`;
    };

    const handleDeleteImageInput = (index, urlIndex) => {
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[index].image = updatedVariants[index].image.filter((_, i) => i !== urlIndex);
            return updatedVariants;
        });
    };

    const handleImageUrlChange = (index, urlIndex, value) => {
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[index].image[urlIndex] = value;
            return updatedVariants;
        });
    };

    const saveVariant = (index) => {
        if (validateVariant()) {
            setVariants((prevVariants) => {
                const updatedVariants = [...prevVariants];
                updatedVariants[index] = { ...currentVariant };
                return updatedVariants;
            });

            setCurrentVariant({
                name: '',
                color: { colorName: '', hexCode: '' },
                sizes: [{ size: '', stock: 0 }],
                material: '',
                price: '',
                discount: 0,
                image: [],
                is_main: false,
                description: '',
            });
        }
    };

    const resetCurrentVariant = () => {
        setCurrentVariant({
            name: '',
            color: { colorName: '', hexCode: '' },
            sizes: [{ size: '', stock: 0 }],
            material: '',
            price: '',
            discount: 0,
            image: [],
            is_main: false,
            description: '',
        });
        setSelectedVariantIndex(null);
    };

    const handleSaveImageUrlsToBackend = (e, index) => {
        const files = Array.from(e.target.files);
        const realImageUrls = files.map((file) => uploadImageToServer(file));

        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[index].image = realImageUrls;
            return updatedVariants;
        });
    };

    const handleSaveEdit = () => {
        if (validateVariant(currentVariant)) {
            const updatedVariants = [...variants];
            updatedVariants[selectedVariantIndex] = currentVariant;
            setVariants(updatedVariants);
            resetCurrentVariant();
        }
    };

    const addNewVariantForm = () => {
        setVariants((prevVariants) => [
            ...prevVariants,
            {
                name: '',
                color: { colorName: '', hexCode: '' },
                sizes: [{ size: '', stock: 0 }],
                material: '',
                price: '',
                discount: 0,
                image: [],
                is_main: false,
                description: '',
            },
        ]);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="godDiv">
                    <div className={`accordionContainer ${activeAccordion === 'variant' ? 'open' : ''}`}>
                        {variants.map((variant, index) => (
                            <div className="godSon" key={index}>
                                <div className="createVariant_Container">
                                    <div className="containerTittle_AdminContainer">
                                        <div className="containerTittle_Admin">
                                            <h2 className='text_createVariant' onClick={() => setActiveAccordion('variant')}>
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
                                                    value={variant.name || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="colorName">Color Name:</label>
                                                <input
                                                    name="colorName"
                                                    type="text"
                                                    id="color.colorName"
                                                    value={variants[index]?.color?.colorName || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="hexCode">Hex Code:</label>
                                                <input
                                                    type="text"
                                                    id="color.hexCode"
                                                    value={variants[index]?.color?.hexCode || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="material">Material:</label>
                                                <input
                                                    name='material'
                                                    type="text"
                                                    id="material"
                                                    value={variants[index]?.material || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="size">Talla:</label>
                                                <input
                                                    type="text"
                                                    id="size"
                                                    placeholder="Ej: M"
                                                    value={currentSize}
                                                    onChange={(e) => setCurrentSize(e.target.value.toUpperCase())}
                                                />

                                                <label htmlFor="stock">Stock:</label>
                                                <input
                                                    type="number"
                                                    id="stock"
                                                    placeholder="Ej: 20"
                                                    value={currentStockNumber}
                                                    onChange={(e) => setCurrentStockNumber(e.target.value)}
                                                />

                                                <div className="sizeContainer_Button">
                                                    <button
                                                        className="submitEditProductButton"
                                                        onClick={() => handleAddSize(index)}
                                                    >
                                                        Enviar talla
                                                    </button>
                                                </div>
                                                <div className="containerSize_Display">
                                                    <ul className="sizeDisplay">
                                                        {variants[index]?.size.map((size, idx) => (
                                                            <li key={idx} className="sizeSelected_Group">
                                                                {size}
                                                                <button
                                                                    className="deleteSize_Button"
                                                                    onClick={() => handleDeleteSize(size, index)}
                                                                >
                                                                    X
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="divForm_Column">
                                                <div className="introduceImage">
                                                    <label htmlFor={`image-${index}`} className="labelImage">Subir Imagen</label>
                                                    <input
                                                        name="image"
                                                        type="file"
                                                        multiple
                                                        id={`image-${index}`}
                                                        className="inputImage"
                                                        onChange={(e) => handleImageUploadChange(e, index)}
                                                    />
                                                </div>
                                                <div className="containerForPreviews">
                                                    {variants[index]?.image.map((imageUrl, imgIndex) => (
                                                        <div key={imgIndex} className="imagePreview">
                                                            <img
                                                                src={imageUrl}
                                                                alt={`Preview ${imgIndex}`}
                                                                className="previewImage"
                                                            />
                                                            <p className="fileName">{variants[index]?.file[imgIndex]}</p>
                                                            <button
                                                                className="deleteImage_Button"
                                                                onClick={() => handleDeleteImageInput(index, imgIndex)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="divForm_Column">
                                                <label htmlFor="img_name">Path to Image</label>
                                                {variants[index]?.image && Array.isArray(variants[index]?.image) && variants[index]?.image.map((image, imgIndex) => (
                                                    <div key={imgIndex}>
                                                        <input
                                                            name={`image-${imgIndex}`}
                                                            type="text"
                                                            value={image}
                                                            onChange={(e) => handleImageUrlChange(index, imgIndex, e.target.value)}
                                                        />
                                                        <button onClick={() => handleDeleteImageInput(index, imgIndex)}>Eliminar casilla</button>
                                                    </div>
                                                ))}
                                                <button onClick={() => handleAddImageInput(index)}>Agregar casilla</button>
                                            </div>


                                            <div className="divForm_Column">
                                                <label htmlFor="price">Precio:</label>
                                                <input
                                                    type="number"
                                                    id="price"
                                                    value={variants[index]?.price || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="discount">Descuento:</label>
                                                <input
                                                    name='discount'
                                                    type="number"
                                                    id="discount"
                                                    value={variants[index]?.discount || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="description">Descripción:</label>
                                                <textarea
                                                    id="description"
                                                    value={variants[index]?.description || ''}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                            <div className="divForm_Column">
                                                <label htmlFor="is_main">¿Es Principal?</label>
                                                <input
                                                    type="checkbox"
                                                    id="is_main"
                                                    checked={variant.is_main}
                                                    onChange={(e) => handleVariantChange(e, index)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div >
            </form>

            <div className="container_ButtonSubmit">
                <div className="container_ButtonSubmitContainer">
                    <div className="submitEdition">
                        <button className="submitCreateButton" onClick={addNewVariantForm}>Agregar Nueva Variante</button>
                    </div>
                    <div className="submitEdition">
                        <button
                            className="submitCreateButton"
                            onClick={(event) => {
                                console.log('Selected Index:', selectedVariantIndex);
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