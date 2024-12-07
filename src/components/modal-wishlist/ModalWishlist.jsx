import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ModalContext } from '../../components/modal-wishlist/ModalContext';
import './modal_wishlist.css';
import MiniLogoTransparentBackground from '../../assets/mini-logos/mini-logo-transparent-background.png'

export const ModalWishlist = () => {
    const { activeModal, closeModal } = useContext(ModalContext);
    const [fadeOut, setFadeOut] = useState(false);
    const [timerActive, setTimerActive] = useState(true); // Controla si el temporizador está activo
    const [mouseOver, setMouseOver] = useState(false);  // Nuevo estado para controlar el mouse sobre el contenedor
    const [timerStartTime, setTimerStartTime] = useState(Date.now()); // Controla el tiempo de inicio del temporizador

    const renderContent = () => {
        if (activeModal === 'modalNeed_toLogin') {
            return (
                <div className="modalWishlist_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Por favor, <NavLink to="/login">inicia sesión</NavLink> para añadir productos a tu wishlist.</p>
                    </div>
                </div>
            );
        } else if (activeModal === 'modalAdded_toWishlist') {
            return (
                <div className="modalWishlist_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Producto añadido a tu wishlist con éxito.</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    useEffect(() => {
        if (activeModal !== 'ModalWishlist') {
            setFadeOut(false); // Resetea el fadeOut cuando el modal se activa
            setTimerActive(true); // Reactiva el temporizador cuando el modal se activa

            // Inicia el temporizador solo si está activo y no hay mouse sobre el modal
            if (timerActive && !mouseOver) {
                const timerInterval = setInterval(() => {
                    if (Date.now() - timerStartTime > 1000) {
                        setFadeOut(true); // Comienza el desvanecimiento después de 1 segundo
                        clearInterval(timerInterval); // Detiene el intervalo después de 1 segundo
                    }
                }, 100);

                return () => clearInterval(timerInterval); // Limpia el intervalo cuando el componente se desmonta o cambia
            }
        }
    }, [activeModal, timerActive, timerStartTime, mouseOver]); // Dependencias para el efecto

    useEffect(() => {
        if (fadeOut) {
            // Después de 1 segundo, cierra el modal
            const timer = setTimeout(() => {
                closeModal();
            }, 1000); // Espera 1 segundo para que el fadeOut termine
            return () => clearTimeout(timer);
        }
    }, [fadeOut, closeModal]);

    // Maneja el evento cuando el mouse entra al contenedor
    const handleMouseEnter = () => {
        setMouseOver(true);  // Establece que el mouse está dentro del modal
        setTimerActive(false);  // Detiene el temporizador cuando el mouse entra
        setTimerStartTime(Date.now()); // Reinicia el tiempo de inicio cuando el mouse entra
        console.log('Mouse está encima del contenedor ModalWishlist');
    };

    // Maneja el evento cuando el mouse sale del contenedor
    const handleMouseLeave = () => {
        setMouseOver(false);  // Establece que el mouse ha salido del modal
        setTimerActive(true);  // Reactiva el temporizador cuando el mouse sale
        console.log('Mouse ha salido del contenedor ModalWishlist');
    };

    return (
        <div className={`ModalWishlist ${activeModal ? 'active slideInVertical' : ''}${fadeOut ? 'fadeOut' : ''}`}
            onMouseEnter={handleMouseEnter}  // Detecta cuando el mouse entra
            onMouseLeave={handleMouseLeave}  // Detecta cuando el mouse sale
        >
            <div className="containerWishlist_Advice">
                <div className="containerIcon_Wishlist"></div>
                <div className="containerMessage_Wishlist">
                    <div className="renderContent_Wishlist">{renderContent()}</div>
                </div>
                <div className="containerButton_Wishlist">
                    <button className='acceptItem_wishlist' onClick={closeModal}>Aceptar</button>
                </div>
            </div>
        </div>
    );
};
