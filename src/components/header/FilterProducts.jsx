    import '../../css/components/header/filter.css';
    import { HeaderContext } from '../../context/HeaderContext';
    import React, { useContext, useRef, useState, useEffect } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';

    export const FilterProducts = () => {
        const { activeMenu, closeMenu } = useContext(HeaderContext);
        const filterContainerRef = useRef(null);
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT, VITE_PRODUCTS_ENDPOINT } = import.meta.env;

        const [filters, setFilters] = useState({ // Estado para almacenar los filtros seleccionados
            gender: '',
            type: '',
            color: [],
            size: [],
        });

        const [options, setOptions] = useState({ // Estado para almacenar las opciones de filtro disponibles
            gender: [],
            type: [],
            color: [],
            size: [],
        });

        const [openAccordions, setOpenAccordions] = useState({ // Estado para controlar si las secciones de filtro están abiertas o cerradas
            gender: true,
            type: false,
            color: false,
            size: false,
        });

        const location = useLocation();
        const navigate = useNavigate();

        // Efecto que obtiene los productos desde la API al cargar el componente
        useEffect(() => {
            const fetchProducts = async () => {
                setLoading(true); // Establece el estado de carga en true
                try {
                    // Realiza la solicitud a la API para obtener los productos
                    const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}`);
                    if (!response.ok) throw new Error('Error al cargar productos');
                    const data = await response.json();
                    setProducts(data); // Almacena los productos en el estado

                    // Extrae las opciones de género de los productos obtenidos
                    const genders = Array.from(new Set(data.map(product => product.gender)));
                    setOptions(prev => ({ ...prev, gender: genders }));
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts(); // Llama a la función para obtener los productos
        }, []); // Este efecto solo se ejecuta una vez cuando el componente se monta

        // Efecto que filtra los productos por género y actualiza las opciones de tipo
        useEffect(() => {
            if (filters.gender) { // Si hay un género seleccionado
                const filteredProducts = products.filter(product => product.gender === filters.gender); // Filtra los productos por género

                // Extrae las opciones de tipo disponibles para los productos filtrados
                const types = Array.from(new Set(filteredProducts.map(product => product.type)));
                setOptions(prev => ({ ...prev, type: types }));

                // Si el tipo seleccionado no existe en los productos filtrados, resetea el filtro de tipo y otros filtros relacionados
                if (!types.includes(filters.type)) {
                    setFilters(prev => ({ ...prev, type: '', color: [], size: [] }));
                }
            }
        }, [filters.gender]); // Este efecto se ejecuta cada vez que se cambia el género seleccionado

        // Efecto que filtra los productos por género y tipo, y actualiza las opciones de color y tamaño
        useEffect(() => {
            if (filters.gender && filters.type) { // Si hay género y tipo seleccionados
                const filteredProducts = products.filter(
                    product => product.gender === filters.gender && product.type === filters.type
                );
        
                // Extrae las opciones de color y tamaño disponibles para los productos filtrados
                const colors = Array.from(
                    new Set(
                        filteredProducts.flatMap(product =>
                            product.variants.map(variant => variant.color.colorName)
                        )
                    )
                );
        
                const sizes = Array.from(
                    new Set(
                        filteredProducts.flatMap(product =>
                            product.variants.flatMap(variant => variant.sizes.map(sizeObj => sizeObj.size))
                        )
                    )
                );
        
                setOptions(prev => ({ ...prev, color: colors, size: sizes })); // Actualiza las opciones de color y tamaño
            }
        }, [filters.gender, filters.type, products]); // Este efecto se ejecuta cada vez que se cambia el género, tipo o productos
        
        // Función para alternar la visibilidad de las secciones de filtro (acordeón)
        const toggleAccordion = (category) => {
            setOpenAccordions(prev => ({
                ...prev,
                [category]: !prev[category], // Cambia el estado de la categoría (abre o cierra)
            }));
        };

        // Función para manejar el cambio de filtros
        const handleFilterChange = (category, value) => {
            if (category === 'gender' || category === 'type') {
                // Si se selecciona un género o tipo, resetea los filtros de color y tamaño
                setFilters(prev => ({ ...prev, [category]: value, color: [], size: [] }));
            } else {
                // Si se selecciona un color o tamaño, agrega o elimina el valor de los filtros
                setFilters(prev => {
                    const currentFilters = prev[category];
                    if (currentFilters.includes(value)) {
                        return { ...prev, [category]: currentFilters.filter(v => v !== value) };
                    } else {
                        return { ...prev, [category]: [...currentFilters, value] };
                    }
                });
            }
        };

        // Función para manejar el envío de filtros
        const handleSubmit = () => {
            const queryParams = new URLSearchParams(); // Crea un objeto para los parámetros de la URL
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length) queryParams.append(key, value.join(',')); // Si el filtro es un array, agrega los valores separados por coma
                } else if (value) {
                    queryParams.append(key, value); // Si el filtro es un valor único, agrega el valor
                }
            });

            // Si estamos en la página de productos, navega a la misma página con los filtros aplicados
            if (location.pathname === '/products') {
                navigate(`/products?${queryParams.toString()}`);
                closeMenu();
            }
        };

        return (
            <div
                ref={filterContainerRef}
                className={`filterContainer ${activeMenu === 'filter' ? 'active slideInHorizontalRightToLeft' : ''}`}
            >
                <button className="closeContainer" onClick={closeMenu}><span className="material-symbols-outlined">
                    close
                </span></button>
                <h2>Filtrar Productos</h2>
                <div className="filtersSection">
                    {/* Filtro por Género */}
                    <div className="filterAccordion_Container">
                        <div className="filterHeader" onClick={() => toggleAccordion('gender')}>
                            <span>Por Género</span>
                            <span className="material-symbols-outlined">
                                {openAccordions.gender ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                            </span>
                        </div>
                        {openAccordions.gender && (
                            <div className="filterContent">
                                {options.gender.map((gender, index) => (
                                    <label key={index} className="custom-label">
                                        <input
                                            type="checkbox"
                                            name="gender"
                                            checked={filters.gender === gender}
                                            onChange={() => handleFilterChange('gender', gender)}
                                        />
                                        {gender}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filtro por Tipo */}
                    {filters.gender && (
                        <div className="filterAccordion_Container">
                            <div className="filterHeader" onClick={() => toggleAccordion('type')}>
                                <span>Por Tipo</span>
                                <span className="material-symbols-outlined">
                                    {openAccordions.type ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                </span>
                            </div>
                            {openAccordions.type && (
                                <div className="filterContent">
                                    {options.type.map((type, index) => (
                                        <label key={index} className="custom-label">
                                            <input
                                                type="checkbox"
                                                name="type"
                                                checked={filters.type === type}
                                                onChange={() => handleFilterChange('type', type)}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filtro por Color */}
                    {filters.type && (
                        <div className="filterAccordion_Container">
                            <div className="filterHeader" onClick={() => toggleAccordion('color')}>
                                <span>Por Color</span>
                                <span className="material-symbols-outlined">
                                    {openAccordions.color ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                </span>
                            </div>
                            {openAccordions.color && (
                                <div className="filterContent">
                                    {options.color.map((color, index) => (
                                        <label key={index} className="custom-label">
                                            <input
                                                type="checkbox"
                                                checked={filters.color.includes(color)}
                                                onChange={() => handleFilterChange('color', color)}
                                            />
                                            {color}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filtro por Tamaño */}
                    {filters.type && (
                        <div className="filterAccordion_Container">
                            <div className="filterHeader" onClick={() => toggleAccordion('size')}>
                                <span>Por Tamaño</span>
                                <span className="material-symbols-outlined">
                                    {openAccordions.size ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                </span>
                            </div>
                            {openAccordions.size && (
                                <div className="filterContent">
                                    {options.size.map((size, index) => (
                                        <label key={index} className="custom-label">
                                            <input
                                                type="checkbox"
                                                checked={filters.size.includes(size)}
                                                onChange={() => handleFilterChange('size', size)}
                                            />
                                            {size}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="container_applyFilter">
                    <button className="applyFilterButton" onClick={handleSubmit}>
                        Aplicar filtros
                    </button>
                </div>
            </div>
        );
    };
