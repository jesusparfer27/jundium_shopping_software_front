import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/pages/homepage.css';

// Importación de recursos multimedia (videos, imágenes)
import SeasonVideo from '../assets/home-sections/home-video-season.mp4';
import AutumnImage from '../assets/home-sections/autumn-session-home.jpg';
import VideoDiscounts from '../assets/home-sections/video-discounts.mp4'

import winterImage from '../assets/home-sections/winter-session-home.jpg';
import bagsWoman from '../assets/home-sections/bags_woman.jpg'
import womanShoes from '../assets/home-sections/woman_shoes.jpg'

import WomanBags from '../assets/different-articles/example-bags-woman-home.jpg';
import ManBags from '../assets/different-articles/example-bags-men-home.jpg';
import WomanTshirts from '../assets/different-articles/example-tshirts-woman-home.jpg';
import ManTshirts from '../assets/different-articles/example-tshirts-man-home.jpg';
import WomanJackets from '../assets/different-articles/example-jackets-woman-home.jpg';
import ManJackets from '../assets/different-articles/example-jackets-men-home.jpg';
import WomanShoes from '../assets/different-articles/example-shoes-woman-home.jpg';
import ManShoes from '../assets/different-articles/example-shoes-man-home.jpg';

import SummerSeason from '../assets/new-season/summer-season-square-home.jpg';
import SpringSeason from '../assets/new-season/spring-season-square-home.jpg';
import WinterSeason from '../assets/new-season/winter-season-square-home.jpg';

export const HomePage = () => {
    // Estados para controlar la animación, desplazamiento y carga de imágenes
    const [offset, setOffset] = useState(0);
    const [scale, setScale] = useState(1);
    const [imagesLoaded, setImagesLoaded] = useState(false); // Controla la animación de las imágenes
    const [imagesToLoad, setImagesToLoad] = useState(0);
    const [animate, setAnimate] = useState(false); // Controla la animación
    const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndexAlternatives, setCurrentIndexAlternatives] = useState(0);
    const [prevIndex, setPrevIndex] = useState(0);
    const carouselRef = useRef(null); // Referencia al carrusel

    const carouselTexts = [
        "DESCUBRE NUESTRA COLECCIÓN DE INVIERNO 2025: ESTILO Y COMODIDAD EN CADA PRENDA.",
        "PRIMAVERA EN TENDENCIA: RENUEVA TU GUARDARROPA CON COLORES VIBRANTES.",
        "VERANO A LA MODA: ¡ENCUENTRA TU LOOK PERFECTO PARA EL CALOR!",
        "ACCESORIOS IRRESISTIBLES: BOLSOS, ZAPATOS Y MÁS QUE COMPLEMENTAN TU OUTFIT.",
        "EDICIONES LIMITADAS: ¡NO TE PIERDAS NUESTRAS PIEZAS MÁS EXCLUSIVAS!",
        "ESTILO ATEMPORAL: MODA MASCULINA DISEÑADA PARA CADA OCASIÓN.",
        "TU ESENCIA, TU ESTILO: ENCUENTRA LA MODA QUE TE DEFINE.",
    ];

    const categoriesData = [ /* Datos de categorías de productos */ 
        { id: 1, name: "Bolsos de Mujer", image: WomanBags, type: "bolso", gender: "mujer" },
        { id: 2, name: "Bolsos de Hombre", image: ManBags, type: "bolso", gender: "hombre" },
        { id: 3, name: "Camisetas de Mujer", image: WomanTshirts, type: "camiseta", gender: "mujer" },
        { id: 4, name: "Camisetas de Hombre", image: ManTshirts, type: "camiseta", gender: "hombre" },
        { id: 5, name: "Chaquetas de Mujer", image: WomanJackets, type: "abrigo", gender: "mujer" },
        { id: 6, name: "Chaquetas de Hombre", image: ManJackets, type: "abrigo", gender: "hombre" },
        { id: 7, name: "Zapatos de Mujer", image: WomanShoes, type: "zapatillas", gender: "mujer" },
        { id: 8, name: "Zapatos de Hombre", image: ManShoes, type: "zapatillas", gender: "hombre" }
    ];

    const seasonsData = [ /* Datos de estaciones y colecciones */
        { id: 1, name: "Verano 2025", image: SummerSeason, endpoint: "/products?collection=Summer%202025" },
        { id: 2, name: "Primavera 2025", image: SpringSeason, endpoint: "/products?collection=Autumn%202025" },
        { id: 3, name: "Invierno 2025", image: WinterSeason, endpoint: "/products?collection=Winter%202025" },
    ];

    const alternatives = [ /* Alternativas para imágenes y textos en la sección principal */
        { id: 1, image: winterImage, text: 'Descubre la nueva colección de invierno.' },
        { id: 2, image: womanShoes, text: 'Explora los looks más elegantes.' },
        { id: 3, image: bagsWoman, text: 'Bolsos diseñados para cada ocasión.' },
    ];

    // Función para manejar la animación entre las alternativas de imágenes
    const handleNext = () => {
        setAnimate(true); // Activa la animación
        setPrevIndex(currentIndexAlternatives); // Almacena el índice actual como el anterior
        setCurrentIndexAlternatives((prevIndex) => (prevIndex + 1) % alternatives.length); // Calcula el siguiente índice
    };


    const { image, text } = alternatives[currentIndexAlternatives];

    // Efecto para actualizar la cantidad de imágenes que se deben cargar
    useEffect(() => {
        setImagesToLoad(categoriesData.length + seasonsData.length); // Suma de imágenes
    }, []);

    // Función para manejar la carga de imágenes y actualizar el estado de imágenes cargadas
    const handleImageLoad = () => {
        setImagesLoadedCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount === imagesToLoad) {
                setImagesLoaded(true); // Cuando todas las imágenes se hayan cargado
            }
            return newCount;
        });
    };


    const extendedData = Array(20).fill([...categoriesData]).flat();

    useEffect(() => {
        // Calcula el número total de elementos en el carrusel
        const totalItems = carouselTexts.length;
    
        // Establece un intervalo que actualiza el índice actual del carrusel cada 3 segundos
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                // Si el índice actual es igual al total de elementos, reinicia al inicio del carrusel
                if (prevIndex === totalItems) {
                    if (carouselRef.current) {
                        // Desactiva la transición para que el salto al inicio sea instantáneo
                        carouselRef.current.style.transition = "none";
                    }
                    return 0; // Reinicia al primer elemento
                }
    
                // Si no es el último elemento, aplica una transición suave para el desplazamiento
                if (carouselRef.current) {
                    carouselRef.current.style.transition = "transform 1s ease-in-out";
                }
    
                // Incrementa el índice actual, asegurándose de que no supere el total de elementos (ciclo continuo)
                return (prevIndex + 1) % totalItems;
            });
        }, 3000); // Cambia cada 3 segundos
    
        // Limpia el intervalo cuando el componente se desmonta o se actualiza
        return () => clearInterval(interval);
    }, [carouselTexts.length]); // Ejecuta este efecto cada vez que cambie la longitud de `carouselTexts`
    


    // Efecto para manejar el desplazamiento y aplicar la escala al hacer scroll
    useEffect(() => {
        const handleScroll = () => {
            const offsetY = window.scrollY;
            const newScale = 1 + (offsetY > 100 ? (offsetY - 100) / 7000 : 0); // Escala que depende del desplazamiento
            setScale(newScale);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll); // Elimina el evento cuando el componente se desmont
        };
    }, []);

    // Elimina el evento cuando el componente se desmonta
    const renderCategories = (data) => (
        data.map((category) => (
            <NavLink
                to={`/products?type=${encodeURIComponent(category.type)}&gender=${encodeURIComponent(category.gender)}`}
                key={category.id}
                className={({ isActive }) => (isActive ? 'myCustomActiveClass' : 'myCustomClass')}
            >
                <div className="imageContainer_home">
                    <img
                        src={category.image}
                        alt={category.name}
                        onLoad={handleImageLoad}
                        className="itemImage"
                        loading="lazy"
                    />
                    <div className="overlay_newCollections">
                        <p className="overlayText_newCollections">{category.name}</p>
                    </div>
                </div>
            </NavLink>
        ))
    );

    // Función para renderizar las estaciones de productos (ej. verano, primavera)
    const renderSeasons = (data) => (
        data.map((season) => (
            <NavLink
                to={season.endpoint}
                key={season.id}
                className="dropItem"
            >
                <div className="imageContainer">
                    <img
                        src={season.image}
                        alt={season.name}
                        onLoad={handleImageLoad}
                        className="itemImageDrops"
                        loading="lazy"
                    />
                </div>
                <div className="itemDescription">
                    <p>{season.name}</p>
                </div>
            </NavLink>
        ))
    );

    return (
        <>
         {/* Sección de video y alternancia de imágenes con texto */}
            <section className="videoScrollContainer">
                <div className="nextButton_Container" id="alternatives-container">
                    <button className="nextButton" onClick={handleNext}>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
                <div className="textsHero_container">
                <p key={currentIndexAlternatives}>{alternatives[currentIndexAlternatives].text}</p>
                </div>
                <div className="videoWrapper">
                    {/* Imagen actual */}
                    <img
                        className={`scrollImage ${animate ? "hidden" : ""}`}
                        src={alternatives[prevIndex].image}
                        alt="Imagen anterior"
                        loading="lazy"
                    />
                    {/* Imagen siguiente */}
                    <img
                        className={`scrollImage ${animate ? "animate" : "hidden"}`}
                        src={alternatives[currentIndexAlternatives].image}
                        alt="Imagen actual"
                        loading="lazy"
                        onAnimationEnd={() => setAnimate(false)} // Desactiva la animación después de completarse
                    />
                </div>
            </section>


            <section className="newCollections">
                <h1 className='h1Style'>Echa un vistazo a los nuevos drops</h1>
                <div className="newDropsHome_Container">
                    <div className="newDropsHome">
                        {renderCategories(categoriesData)} {/* Renderiza las categorías de productos */}
                    </div>
                </div>
            </section>

            {/* Carrusel de textos */}
            <section className="carruselContainer_newCollections">
                <div
                    className="carruselTrack"
                    ref={carouselRef}
                >
                    {[...carouselTexts, ...carouselTexts].map((text, index) => (
                        <div className="carruselSlide" key={index}>
                            <p className="carruselText">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Video promocional */}
            <section className="container_videoSession-2">
                <div>
                    <NavLink to="/products" className="videoLink">
                        <div className="videoContentWrapper">
                            <video
                                className="videoElement"
                                autoPlay
                                muted
                                loop
                                playsInline
                                onError={() => console.error('Error al cargar el video')}
                            >
                                <source src={SeasonVideo} type="video/mp4" />
                                Tu navegador no soporta la reproducción de videos.
                            </video>
                        </div>
                    </NavLink>
                </div>
            </section>

            {/* Carrusel de productos */}
            <section className="carruselHome">
                <div className="leftVideoContainer">
                    <video
                        className='videoCarousel'
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => console.error('Error al cargar el video')}
                        src={VideoDiscounts}></video>
                </div>
                <div className="rightCarouselContainer">
                    <div className="carousel" ref={carouselRef} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {extendedData.map((category, index) => (
                            <NavLink
                                to={`/products?type=${encodeURIComponent(category.type)}&gender=${encodeURIComponent(category.gender)}`}
                                key={index}
                                className="carouselItem"
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="carouselImage"
                                    loading="lazy"
                                />
                                <div className="carousel_textContainer_Home">
                                    <p className='carousel_textContainer_homeText'>{category.name}</p>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </section>

            {/* Imagen de otoño con escalado */}
            <section className="container_image_autumn stickyVideo">
                <div>
                    <NavLink to="/products" className="videoLink2">
                        <img className='imageAutumn'
                            style={{ transform: `scale(${scale})`, transition: 'transform 0.1s ease' }}
                            src={AutumnImage}
                            alt="Imagen de otoño"
                            loading="lazy"
                        />
                    </NavLink>
                </div>
            </section>

            {/* Sección de temporada */}
            <div className="newCollections lastSection">
                <div className="newCollections_Container">
                    <h1 className='h1Style'>Echa un vistazo a la nueva temporada</h1>
                    <div className="newCollections_Block">
                        <div className="newDropsHome2">
                            {renderSeasons(seasonsData)} {/* Renderiza las estaciones */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;