import React, { useContext, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeaderContext } from '../../context/HeaderContext';
import axios from 'axios';

import '../../css/components/header/search.css';

import ManSectionHeader from '../../assets/header-sections/example-menu-header-man-section.jpg';
import WomanSectionHeader from '../../assets/header-sections/example-menu-header-woman-section.jpg';
import CollectionsSectionHeader from '../../assets/season-images-product_page/example-summer-season.jpg';
import DiscountSectionHeader from '../../assets/season-images-product_page/example-spring-season.jpg';

const categoriesData = [
    { id: 1, name: "Otoño collection", image: ManSectionHeader, collection: "Otoño 2024", type: "Autumn" },
    { id: 2, name: "Invierno collection", image: WomanSectionHeader, collection: "Invierno 2024", type: "Winter" },
    { id: 3, name: "Primavera collection", image: CollectionsSectionHeader, collection: "Primavera 2024", type: "Spring" },
    { id: 4, name: "Verano collection", image: DiscountSectionHeader, collection: "Verano 2024", type: "Summer" }
];

const HeaderSearch = () => {
    const { activeMenu, openMenu } = useContext(HeaderContext);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [gender, setGender] = useState('');
    const [type, setType] = useState('');
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const { VITE_API_BACKEND, VITE_PRODUCTS_ENDPOINT, VITE_BACKEND_ENDPOINT } = import.meta.env;

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setShowRecommendations(term.length > 0);

        if (term) {
            try {
                const response = await axios.get(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}${VITE_PRODUCTS_ENDPOINT}`);
                const products = response.data;

                // Usamos un Set para almacenar los nombres únicos
                const uniqueProductNames = new Set();

                const filteredRecommendations = products
                    .flatMap((product) =>
                        product.variants
                            .filter((variant) => {
                                const matchesSearchTerm =
                                    variant.name.toLowerCase().includes(term.toLowerCase()) ||
                                    product.brand.toLowerCase().includes(term.toLowerCase()) ||
                                    product.collection.toLowerCase().includes(term.toLowerCase()) ||
                                    product.type.toLowerCase().includes(term.toLowerCase()) ||
                                    product.gender.toLowerCase().includes(term.toLowerCase()) ||
                                    variant.color?.colorName?.toLowerCase().includes(term.toLowerCase()) ||
                                    variant.material.toLowerCase().includes(term.toLowerCase()) ||
                                    variant.description.toLowerCase().includes(term.toLowerCase());

                                const matchesGender = gender ? product.gender.toLowerCase() === gender.toLowerCase() : true;
                                const matchesType = type ? product.type.toLowerCase() === type.toLowerCase() : true;

                                return matchesSearchTerm && matchesGender && matchesType;
                            })
                            .map((variant) => {
                                // Si el nombre ya está en el Set, lo omitimos
                                if (uniqueProductNames.has(variant.name)) {
                                    return null;  // Omite este item
                                }

                                uniqueProductNames.add(variant.name);  // Añade el nombre al Set

                                return {
                                    name: variant.name,
                                    productId: product._id,
                                    variantId: variant.variant_id,
                                };
                            })
                    )
                    .filter(Boolean);  // Filtra los valores nulos (cuando se omiten elementos)

                setRecommendations(filteredRecommendations.slice(0, 5)); // Limitar a 5 recomendaciones
            } catch (error) {
                console.error('Error fetching product recommendations:', error);
            }
        } else {
            setRecommendations([]); // Limpiar recomendaciones si no hay término de búsqueda
        }
    };



    const handleSearchSubmit = () => {
        if (searchTerm.trim() === "") return; // Evitar la búsqueda vacía

        let searchQuery = `/products?search=${encodeURIComponent(searchTerm)}`;

        if (gender) {
            searchQuery += `&gender=${encodeURIComponent(gender)}`;
        }

        if (type) {
            searchQuery += `&type=${encodeURIComponent(type)}`;
        }

        navigate(searchQuery); // Navegar solo cuando el usuario decide hacer la búsqueda
    };


    const handleLinkClick = () => {
        openMenu(null);
    };

    const handleCloseSearch = () => {
        openMenu(null);
    };

    return (
        <div ref={searchRef} className={`searchContainer ${activeMenu === 'searchBar' ? 'active' : ''}`}>
            <div className={`searchInputContainer ${activeMenu === 'searchBar' ? 'slideInVertical' : 'slideOutVertical'}`}>
                <div className="searchContent flexRow">
                    <input
                        type="text"
                        placeholder="Inserte su búsqueda..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`searchBar ${activeMenu === 'searchBar' ? 'activeSearch' : ''}`}
                    />
                    <div className="groupButtons_Header">
                        <button className="closeButtonHeader" onClick={handleCloseSearch}><span className="material-symbols-outlined">
                            close
                        </span></button>
                        <button className="searchButton" onClick={handleSearchSubmit}><span className="material-symbols-outlined">
                            search
                        </span></button>
                    </div>
                </div>
            </div>

            <div className="searchBarRecentSearches_Container">
                <div className="recentSearches_Block">
                    <div className="recentSearches_Container">
                        <div className="recentSearches_block">
                            <ul className='recentSearches_flexRow'>
                                <span>Busquedas recientes</span>
                                <li><NavLink to="/products?search=Renueva%20en%20ofertas" onClick={handleLinkClick}>Renueva en ofertas</NavLink></li>
                                <li><NavLink to="/products?search=Descubre%20trends" onClick={handleLinkClick}>Descubre trends</NavLink></li>
                                <li><NavLink to="/products?search=Eventos%20de%20última%20hora" onClick={handleLinkClick}>Eventos de última hora</NavLink></li>
                                <li><NavLink to="/products?search=Zapatillas%20de%20polietileno" onClick={handleLinkClick}>Zapatillas de polietileno</NavLink></li>
                            </ul>
                        </div>
                    </div>

                    <div className={`searchRecomendation_Container ${showRecommendations ? 'visible' : 'hidden'}`}>
                        <div className="searchRecomendation_flexColumn"></div>
                        <div className="searchRecomendation_flexColumn">
                            <span>Para explorar...</span>
                            <ul className="groupList_searchesRecomendations">
                                {recommendations.map((rec, index) => (
                                    <li className="recomendSearches" key={index}>
                                        <NavLink
                                            className="searchRecommendation_Navlink"
                                            to={`/products?search=${encodeURIComponent(rec.name)}`}
                                            onClick={handleLinkClick}
                                        >
                                            <span className="material-symbols-outlined">search</span>
                                            {rec.name}
                                        </NavLink>

                                    </li>
                                ))}
                            </ul>


                        </div>
                    </div>
                </div>
            </div>

            <div className={`additionalTextContainer ${activeMenu === 'searchBar' ? 'slideInWithDelay' : 'slideOutWithDelay'}`}>
                <div className="flexRow">
                    <div className="popularSearches">
                        <div className="genderSearch">
                            <div className="maleSearch">
                                <h4>Hombre</h4>
                                <ul>
                                    <li><NavLink to="/category/camisetas" onClick={() => setType('camisetas')}>Camisetas</NavLink></li>
                                    <li><NavLink to="/category/zapatos" onClick={() => setType('zapatos')}>Zapatos</NavLink></li>
                                    <li><NavLink to="/category/pantalones" onClick={() => setType('pantalones')}>Pantalones</NavLink></li>
                                </ul>
                            </div>
                            <div className="femaleSearch">
                                <h4>Mujer</h4>
                                <ul>
                                    <li><NavLink to="/category/vestidos" onClick={() => setType('vestidos')}>Vestidos</NavLink></li>
                                    <li><NavLink to="/category/tacones" onClick={() => setType('tacones')}>Tacones</NavLink></li>
                                    <li><NavLink to="/category/accesorios" onClick={() => setType('accesorios')}>Accesorios</NavLink></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="productGridHeader">
                        <div className="gridContainer">
                            {categoriesData.map((category) => (
                                <NavLink
                                    to={`/products?${category.collection ? `collection=${encodeURIComponent(category.collection)}` : `type=${encodeURIComponent(category.type)}`}`}
                                    key={category.id}
                                    className="productItemHeader"
                                    onClick={handleLinkClick}
                                >
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="searchHeader_Image"
                                    />
                                    <div className="containerZ-index_Search">
                                        <p className='z-index_nameSearch'>{category.name}</p>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderSearch;
