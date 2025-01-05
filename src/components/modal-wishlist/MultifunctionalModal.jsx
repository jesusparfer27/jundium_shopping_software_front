import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ModalContext } from './ModalContext';
import './multifunctional_wishlist.css';
import MiniLogoTransparentBackground from '../../assets/mini-logos/mini-logo-transparent-background.png'

export const MultifunctionalModal = () => {
    const { activeModal, closeModal } = useContext(ModalContext);
    const [fadeOut, setFadeOut] = useState(false);
    const [timerActive, setTimerActive] = useState(true);
    const [mouseOver, setMouseOver] = useState(false);
    const [timerStartTime, setTimerStartTime] = useState(Date.now());

    const renderContent = () => {
        if (activeModal === 'modalNeed_toLogin') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Por favor, <NavLink to="/login">inicia sesión</NavLink> para añadir este producto.</p>
                    </div>
                </div>
            );
        } else if (activeModal === 'modalAdded_toWishlist') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Producto añadido a tu wishlist con éxito.</p>
                    </div>
                </div>
            );
        }  else if (activeModal === 'modalAlready_inWishlist') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Este producto ya está en tu wishlist.</p>
                    </div>
                </div>
            );
        } else if (activeModal === 'modalAdded_toCart') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo" alt="Mini Logo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Producto añadido al carrito con éxito.</p>
                    </div>
                </div>
            );
        } else if (activeModal === 'modalSelectSize') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo" alt="Mini Logo" />
                    </div>
                    <div className="sectionContent">
                        <p>Por favor, elige una talla antes de añadir el producto al carrito.</p>
                    </div>
                </div>
            );
        } else if (activeModal === 'modalOrderSuccessful') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo" alt="Mini Logo" />
                    </div>
                    <div className="sectionContent">
                        <p>¡Pedido realizado con éxito! Tu compra está siendo procesada.</p>
                    </div>
                </div>
            );
        } else if (activeModal === 'modalOutOfStock') {
            return (
                <div className="multifunctionalModal_containerFather">
                    <div className="miniLogo_modalContainer">
                        <img src={MiniLogoTransparentBackground} className="miniLogo_transparentLogo" alt="Mini Logo"></img>
                    </div>
                    <div className="sectionContent">
                        <p>Lo siento, no hay suficiente stock para agregar más de este producto a tu carrito.</p>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    useEffect(() => {
        if (activeModal !== 'multifunctionalModal') {
            setFadeOut(false);
            setTimerActive(true);

            if (timerActive && !mouseOver) {
                const timerInterval = setInterval(() => {
                    if (Date.now() - timerStartTime > 500) {
                        setFadeOut(true);
                        clearInterval(timerInterval);
                    }
                }, 100);

                return () => clearInterval(timerInterval);
            }
        }
    }, [activeModal, timerActive, timerStartTime, mouseOver]);

    useEffect(() => {
        if (fadeOut) {
            const timer = setTimeout(() => {
                closeModal();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [fadeOut, closeModal]);

    return (
        <div className={`multifunctionalModal ${activeModal ? 'active slideInVertical' : ''}${fadeOut ? 'fadeOut' : ''}`}>
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
