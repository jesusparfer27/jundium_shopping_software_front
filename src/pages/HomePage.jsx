import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/pages/homepage.css';

import PreloaderGif from '../assets/preloader-home/preloader-home.gif'

import SeasonVideo from '../assets/home-sections/home-video-season.mp4';
import AutumnImage from '../assets/home-sections/autumn-session-home.jpg';
import VideoDiscounts from '../assets/home-sections/video-discounts.mp4'

import winterImage from '../assets/home-sections/winter-session-home.jpg';
import looksWoman from '../assets/home-sections/looks_woman.jpg'
import bagsWoman from '../assets/home-sections/bags_woman.jpg'


import VideoGif from '../assets/video-gif-home/video-gif.gif'

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
    const [offset, setOffset] = useState(0);
    const [scale, setScale] = useState(1);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [imagesToLoad, setImagesToLoad] = useState(0);
    const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndexAlternatives, setCurrentIndexAlternatives] = useState(0);
    const carouselRef = useRef(null);

    const carouselTexts = [
        "DESCUBRE NUESTRA COLECCIÓN DE INVIERNO 2024: ESTILO Y COMODIDAD EN CADA PRENDA.",
        "PRIMAVERA EN TENDENCIA: RENUEVA TU GUARDARROPA CON COLORES VIBRANTES.",
        "VERANO A LA MODA: ¡ENCUENTRA TU LOOK PERFECTO PARA EL CALOR!",
        "ACCESORIOS IRRESISTIBLES: BOLSOS, ZAPATOS Y MÁS QUE COMPLEMENTAN TU OUTFIT.",
        "EDICIONES LIMITADAS: ¡NO TE PIERDAS NUESTRAS PIEZAS MÁS EXCLUSIVAS!",
        "ESTILO ATEMPORAL: MODA MASCULINA DISEÑADA PARA CADA OCASIÓN.",
        "TU ESENCIA, TU ESTILO: ENCUENTRA LA MODA QUE TE DEFINE.",
    ];

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

    const alternatives = [
        { id: 1, image: winterImage, text: 'Descubre la nueva colección de invierno.' },
        { id: 2, image: looksWoman, text: 'Explora los looks más elegantes.' },
        { id: 3, image: bagsWoman, text: 'Bolsos diseñados para cada ocasión.' },
    ];


    const handleNext = () => {
        setCurrentIndexAlternatives((prevIndex) => (prevIndex + 1) % alternatives.length);
    };

    const { image, text } = alternatives[currentIndexAlternatives];


    useEffect(() => {
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


    const extendedData = Array(20).fill([...categoriesData]).flat();
    // const extendedDataCarousel = Array(8).fill([...carouselTexts]).flat();

    useEffect(() => {
        const totalItems = carouselTexts.length;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                if (prevIndex === totalItems) {
                    if (carouselRef.current) {
                        carouselRef.current.style.transition = "none";
                        return 0;
                    }
                }
                if (carouselRef.current) {
                    carouselRef.current.style.transition = "transform 1s ease-in-out";
                }
                return (prevIndex + 1) % totalItems;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [carouselTexts.length]);


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
        <>
            <section className="videoScrollContainer">
                <div className="nextButton_Container">
                    <button className="nextButton" onClick={handleNext}>
                        &#8594;
                    </button>
                </div>
                <div className="textsHero_container">
                        <p>{text}</p>
                    </div>
                <div className="videoWrapper">
                    <img
                        className="scrollImage"
                        src={image}
                        alt="Imagen del Hero"
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
                            {/* <div className="textOverlay">
                                <div className="textOverlay">
                                    <img
                                        src={VideoGif}
                                        alt="GIF animado"
                                        className="gifElement"
                                        style={{ animation: 'none', height: '100%', width: 'auto' }}
                                    />
                                </div>
                            </div> */}
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
                {/* <img src={PreloaderGif} alt="Cargando..." /> */}
            </div>
            </>
    );
};

export default HomePage;