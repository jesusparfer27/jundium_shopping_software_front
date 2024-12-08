import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/pages/homepage.css';

// IMAGES
// HOME-SECTIONS
import SeasonVideo from '../assets/home-sections/home-video-season.mp4';
import AutumnImage from '../assets/home-sections/autumn-session-home.jpg';
import winterImage from '../assets/home-sections/winter-session-home.jpg';
import VideoDiscounts from '../assets/home-sections/video-discounts.mp4'

import VideoGif from '../assets/video-gif-home/video-gif.gif'

// HOME-ARTICLES
import WomanBags from '../assets/different-articles/example-bags-woman-home.jpg';
import ManBags from '../assets/different-articles/example-bags-men-home.jpg';
import WomanTshirts from '../assets/different-articles/example-tshirts-woman-home.jpg';
import ManTshirts from '../assets/different-articles/example-tshirts-man-home.jpg';
import WomanJackets from '../assets/different-articles/example-jackets-woman-home.jpg';
import ManJackets from '../assets/different-articles/example-jackets-men-home.jpg';
import WomanShoes from '../assets/different-articles/example-shoes-woman-home.jpg';
import ManShoes from '../assets/different-articles/example-shoes-man-home.jpg';

// HOME-NEW-SEASON
import SummerSeason from '../assets/new-season/summer-season-square-home.jpg';
import SpringSeason from '../assets/new-season/spring-season-square-home.jpg';
import WinterSeason from '../assets/new-season/winter-season-square-home.jpg';

export const HomePage = () => {
    const [offset, setOffset] = useState(0);
    const [scale, setScale] = useState(1); // Estado para el zoom
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [imagesToLoad, setImagesToLoad] = useState(0);
    const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    const categoriesData = [
        { id: 1, name: "Bolsos de Mujer", image: WomanBags, type: "bolso", gender: "mujer" },
        { id: 2, name: "Bolsos de Hombre", image: ManBags, type: "bolso", gender: "hombre" },
        { id: 3, name: "Camisetas de Mujer", image: WomanTshirts, type: "camiseta", gender: "mujer" },
        { id: 4, name: "Camisetas de Hombre", image: ManTshirts, type: "camiseta", gender: "hombre" },
        { id: 5, name: "Chaquetas de Mujer", image: WomanJackets, type: "abrigo", gender: "mujer" },
        { id: 6, name: "Chaquetas de Hombre", image: ManJackets, type: "abrigo", gender: "hombre" },
        { id: 7, name: "Zapatos de Mujer", image: WomanShoes, type: "zapatillas", gender: "mujer" },
        { id: 8, name: "Zapatos de Hombre", image: ManShoes, type: "zapatillas", gender: "hombre" }
    ];

    const seasonsData = [
        { id: 1, name: "Verano 2024", image: SummerSeason, endpoint: "/products?collection=Verano%202024" },
        { id: 2, name: "Primavera 2024", image: SpringSeason, endpoint: "/products?collection=Primavera%202024" },
        { id: 3, name: "Invierno 2024", image: WinterSeason, endpoint: "/products?collection=Invierno%202024" },
    ];


    useEffect(() => {
        // Set the number of images to load initially
        setImagesToLoad(categoriesData.length + seasonsData.length);
    }, []);

    const handleImageLoad = () => {
        setImagesLoadedCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount === imagesToLoad) {
                setImagesLoaded(true);
            }
            return newCount;
        });
    };

    // Duplicar los datos para el efecto de loop
    // Duplicar los datos para el efecto de loop
    const extendedData = Array(2).fill([...categoriesData]).flat();

    useEffect(() => {
        const totalItems = extendedData.length / 2; // La mitad de extendedData es el conjunto real.
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const newIndex = prevIndex + 1;

                if (newIndex >= totalItems) {
                    // Reinicia el índice sin transición visible
                    if (carouselRef.current) {
                        carouselRef.current.style.transition = 'none'; // Desactiva la transición momentáneamente
                    }
                    setCurrentIndex(0); // Reinicia al primer elemento
                    return 0;
                }

                if (carouselRef.current) {
                    carouselRef.current.style.transition = 'transform 1s ease'; // Transición más lenta
                }

                return newIndex;
            });
        }, 4000); // Intervalo ajustado a 4 segundos

        return () => clearInterval(interval); // Limpieza al desmontar
    }, [extendedData.length]);



    useEffect(() => {
        const handleScroll = () => {
            const offsetY = window.scrollY;
            const newScale = 1 + (offsetY > 100 ? (offsetY - 100) / 7000 : 0);
            setScale(newScale);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
        <main className="images-loaded">
            <section className="videoScrollContainer">
                <div className="videoWrapper">
                    <img
                        className="scrollImage"
                        style={{ transform: `scale(${scale})`, transition: 'transform 0.1s ease' }}
                        src={winterImage}
                        alt="Imagen de fondo"
                        loading="lazy"
                    />
                </div>
            </section>

            <section className="newCollections">
                <h1 className='h1Style'>Echa un vistazo a los nuevos drops</h1>
                <div className="newDropsHome_Container">
                    <div className="newDropsHome">
                        {renderCategories(categoriesData)}
                    </div>
                </div>
            </section>

            <section className="container_videoSession-2">
                <div>
                    <NavLink to="/video" className="videoLink">
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
                            <div className="textOverlay">
                                <div className="textOverlay">
                                    <img
                                        src={VideoGif}
                                        alt="GIF animado"
                                        className="gifElement"
                                        style={{ animation: 'none', height: '100%', width: 'auto' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </NavLink>
                </div>
            </section>

            <section className="carruselHome">
                <div className="leftVideoContainer">
                    {/* <p>Descubre nuestros productos destacados</p> */}
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

            <section className="container_image_autumn stickyVideo">
                <div>
                    <NavLink to="/video" className="videoLink2">
                        <img className='imageAutumn'
                            style={{ transform: `scale(${scale})`, transition: 'transform 0.1s ease' }}
                            src={AutumnImage}
                            alt="Imagen de otoño"
                            loading="lazy"
                        />
                    </NavLink>
                </div>
            </section>

            <div className="newCollections lastSection">
                <div className="newCollections_Container">
                    <h1 className='h1Style'>Echa un vistazo a la nueva temporada</h1>
                    <div className="newCollections_Block">
                        <div className="newDropsHome2">
                            {renderSeasons(seasonsData)}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default HomePage;
