import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeaderContext } from '../../context/HeaderContext';
import '../../css/components/header/header.css';
import '../../css/components/header/menu.css';

// IMAGENES DE HEADERMENU
import ManSectionHeader from '../../assets/header-sections/example-menu-header-man-section.jpg';
import WomanSectionHeader from '../../assets/header-sections/example-menu-header-woman-section.jpg';
import CollectionsSectionHeader from '../../assets/season-images-product_page/example-spring-season.jpg';
import DiscountSectionHeader from '../../assets/season-images-product_page/example-summer-season.jpg';

const HeaderMenu = () => {
    const { activeMenu, closeMenu, setMenuOpen } = useContext(HeaderContext); // Contexto para manejar el estado del menú.
    const sideMenuRef = useRef(null); // Referencia al menú lateral.
    const location = useLocation(); // Obtiene la ruta actual.
    const [showGenderSection, setShowGenderSection] = useState(''); // Estado para mostrar la sección seleccionada.
    const [isClosing, setIsClosing] = useState(false); // Controla la animación de cierre del menú.
    const [isClickable, setIsClickable] = useState(true); // Deshabilita clics durante animaciones.
    const [color, setColor] = useState('transparent'); // Cambia el color de fondo dinámicamente.
    const [sectionImage, setSectionImage] = useState(''); // Establece la imagen de la sección.

    useEffect(() => {
        setMenuOpen(false); // Cierra el menú al cambiar de ruta.
    }, [location.pathname, setMenuOpen]);

    const handleGenderClick = (gender) => {
        if (!isClickable) return; // Previene acciones si el menú no es clickeable.
        setShowGenderSection((prev) => (prev === gender ? '' : gender)); // Alterna entre mostrar y ocultar la sección seleccionada.

        switch (gender) {
            case 'Hombre':
                setColor('#FFFFFF'); // Establece el color de fondo.
                setSectionImage(ManSectionHeader); // Asocia la imagen.
                break;
            case 'Mujer':
                setColor('#FFFFFF');
                setSectionImage(WomanSectionHeader);
                break;
            case 'Colecciones':
                setColor('#FFFFFF');
                setSectionImage(CollectionsSectionHeader);
                break;
            case 'Descuentos':
                setColor('#FFFFFF');
                setSectionImage(DiscountSectionHeader);
                break;
            default:
                setColor('transparent');
                setSectionImage('');
                break;
        }
    };

    const handleCloseMenu = () => {
        setIsClosing(true); // Inicia la animación de cierre.
        setIsClickable(false); // Deshabilita clics durante el cierre.
        setTimeout(() => {
            closeMenu(); // Cierra el menú después de la animación.
            setIsClosing(false); // Resetea la animación.
            setIsClickable(true); // Habilita los clics nuevamente.
        }, 300);
    };

    const handleLinkClick = () => {
        setMenuOpen(false); // Cierra el menú al hacer clic en un enlace.
        handleCloseMenu(); // Llama al cierre del menú con animación.
        window.scrollTo(0, 0); // Lleva la página al inicio.
    };

    return (
        <>
            <div
                ref={sideMenuRef}
                className={`sideMenu ${activeMenu === 'sideMenu' ? 'open slideInHorizontal' : (isClosing ? 'close slideOutHorizontal' : '')}`}
            >
                <button className="closeMenu" onClick={handleCloseMenu}><span className="material-symbols-outlined">
                    close
                </span></button>
                <h2>Filtrar por:</h2>
                <button className="filterButtonMenu" onClick={() => handleGenderClick('Hombre')}>Hombre</button>
                <button className="filterButtonMenu" onClick={() => handleGenderClick('Mujer')}>Mujer</button>
                <button className="filterButtonMenu" onClick={() => handleGenderClick('Colecciones')}>Colecciones</button>
                <button className="filterButtonMenu" onClick={() => handleGenderClick('Descuentos')}>Descuentos</button>
                <div className="headerFooter">
                    <div className="soporte">
                        <div className="title-headerFooter">Soporte</div>
                        <Link to="/contact-us">Contact Us</Link>
                        <Link to="/faq">FAQ</Link>
                        <Link to="/terms">Terms and Conditions</Link>
                    </div>
                </div>
            </div>

            {showGenderSection && (
                <div
                    className={`genderSection ${activeMenu === 'sideMenu' ? 'open' : 'close'}`}
                    style={{ backgroundColor: color }}
                >
                    <div
                        className="sectionImage"
                        style={{
                            backgroundImage: `url(${sectionImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '90%',
                            height: '300px',
                            margin: '10px auto',
                        }}
                    ></div>
                    <h3
                        style={{
                            color: 'black',
                            paddingLeft: '1rem',
                            paddingTop: '2rem'
                        }}
                    >
                        Productos de {showGenderSection}
                    </h3>
                    <div className="productNav">
                        {showGenderSection === 'Mujer' && (
                            <>
                                <Link to={`/products?type=bolso&gender=mujer`} onClick={handleLinkClick}>Bolsos</Link>
                                <Link to={`/products?type=camiseta&gender=mujer`} onClick={handleLinkClick}>Camisetas</Link>
                                <Link to={`/products?type=abrigo&gender=mujer`} onClick={handleLinkClick}>Chaquetas</Link>
                                <Link to={`/products?type=zapatillas&gender=mujer`} onClick={handleLinkClick}>Zapatos</Link>
                            </>
                        )}
                        {showGenderSection === 'Hombre' && (
                            <>
                                <Link to={`/products?type=bolso&gender=hombre`} onClick={handleLinkClick}>Bolsos</Link>
                                <Link to={`/products?type=camiseta&gender=hombre`} onClick={handleLinkClick}>Camisetas</Link>
                                <Link to={`/products?type=chaqueta&gender=hombre`} onClick={handleLinkClick}>Chaquetas</Link>
                                <Link to={`/products?type=zapatillas&gender=hombre`} onClick={handleLinkClick}>Zapatos</Link>
                            </>
                        )}
                        {showGenderSection === 'Colecciones' && (
                            <>
                                <Link to={`/products?gender=hombre`} onClick={handleLinkClick}>Nuevas Llegadas</Link>
                                <Link to={`/products?gender=mujer`} onClick={handleLinkClick}>Colección de Temporada</Link>
                            </>
                        )}
                        {showGenderSection === 'Descuentos' && (
                            <>
                                <Link to={`/products?type=discounts&gender=all`} onClick={handleLinkClick}>Ofertas Especiales</Link>
                                <Link to={`/products?type=clearance&gender=all`} onClick={handleLinkClick}>Liquidaciones</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default HeaderMenu;
