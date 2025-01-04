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

    const [filters, setFilters] = useState({
        gender: '',
        type: '',
        color: [],
        size: [],
    });

    const [options, setOptions] = useState({
        gender: [],
        type: [],
        color: [],
        size: [],
    });

    const [openAccordions, setOpenAccordions] = useState({
        gender: true,
        type: false,
        color: false,
        size: false,
    });

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}`);
                if (!response.ok) throw new Error('Error al cargar productos');
                const data = await response.json();
                setProducts(data);

                // Derive unique options for gender
                const genders = Array.from(new Set(data.map(product => product.gender)));
                setOptions(prev => ({ ...prev, gender: genders }));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Update options for type, color, and size when filters.gender or filters.type change
    useEffect(() => {
        if (filters.gender) {
            const filteredProducts = products.filter(product => product.gender === filters.gender);

            const types = Array.from(new Set(filteredProducts.map(product => product.type)));
            setOptions(prev => ({ ...prev, type: types }));

            if (!types.includes(filters.type)) {
                setFilters(prev => ({ ...prev, type: '', color: [], size: [] }));
            }
        }
    }, [filters.gender]);

    useEffect(() => {
        if (filters.gender && filters.type) {
            const filteredProducts = products.filter(
                product => product.gender === filters.gender && product.type === filters.type
            );
    
            // Recopila colores únicos desde las variantes
            const colors = Array.from(
                new Set(
                    filteredProducts.flatMap(product =>
                        product.variants.map(variant => variant.color.colorName)
                    )
                )
            );
    
            // Recopila tamaños únicos desde las variantes
            const sizes = Array.from(
                new Set(
                    filteredProducts.flatMap(product =>
                        product.variants.flatMap(variant => variant.sizes.map(sizeObj => sizeObj.size))
                    )
                )
            );
    
            setOptions(prev => ({ ...prev, color: colors, size: sizes }));
        }
    }, [filters.gender, filters.type, products]);
    

    const toggleAccordion = (category) => {
        setOpenAccordions(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleFilterChange = (category, value) => {
        if (category === 'gender' || category === 'type') {
            setFilters(prev => ({ ...prev, [category]: value, color: [], size: [] }));
        } else {
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

    const handleSubmit = () => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length) queryParams.append(key, value.join(','));
            } else if (value) {
                queryParams.append(key, value);
            }
        });

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
                                        type="radio"
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
                                            type="radio"
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
