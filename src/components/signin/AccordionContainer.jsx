import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../css/components/signin/accordion.css';

const AccordionContainer = ({ isAccordionOpen = [], toggleAccordion }) => {
    
    const handleToggle = (index) => {
        if (typeof toggleAccordion === 'function') {
            toggleAccordion(index);
        }
    };

    const isEmailValidationRoute = location.pathname === '/email-validation-2';

    return (
        <div  className={`accordion-container ${isEmailValidationRoute ? 'email-validation-padding' : ''}`}>
            <div className="accordion-group1">
                <p className="tittle-accordion-group">AL CREAR UNA CUENTA PODEMOS</p>

                {/* Acordeón 1 */}
                <div
                    className={`accordion-item ${isAccordionOpen[0] ? 'open' : ''}`}
                    onClick={() => handleToggle(0)}
                >
                    <div className="accordion-row">
                        <div className="accordion-icon">
                            <span className="material-symbols-outlined">mail</span>
                            <label className="accordion-header-text"> Comunicación Eficiente</label>
                        </div>
                    </div>
                    {isAccordionOpen[0] && (
                        <div className="accordion-body">
                            <p>Mantente al tanto con notificaciones exclusivas sobre ofertas especiales, novedades y promociones personalizadas enviadas directamente a tu correo.</p>
                        </div>
                    )}
                </div>

                {/* Acordeón 2 */}
                <div
                    className={`accordion-item ${isAccordionOpen[1] ? 'open' : ''}`}
                    onClick={() => handleToggle(1)}
                >
                    <div className="accordion-row">
                        <div className="accordion-icon">
                            <span className="material-symbols-outlined">person</span>
                            <label className="accordion-header-text">Personalización Total</label>
                        </div>
                    </div>
                    {isAccordionOpen[1] && (
                        <div className="accordion-body">
                            <p>Accede a una experiencia personalizada basada en tus preferencias, historial de compras y productos favoritos.</p>
                        </div>
                    )}
                </div>

                {/* Acordeón 3 */}
                <div
                    className={`accordion-item ${isAccordionOpen[2] ? 'open' : ''}`}
                    onClick={() => handleToggle(2)}
                >
                    <div className="accordion-row">
                        <div className="accordion-icon">
                            <span className="material-symbols-outlined">favorite</span>
                            <label className="accordion-header-text">Listas de Deseos</label>
                        </div>
                    </div>
                    {isAccordionOpen[2] && (
                        <div className="accordion-body">
                            <p>Crea y guarda listas de tus artículos favoritos para comprarlos más tarde o compartirlos con amigos.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="accordion-group2">
                <p className="tittle-accordion-group">AL CREAR UNA CUENTA PODEMOS</p>

                {/* Acordeón 4 */}
                <div
                    className={`accordion-item ${isAccordionOpen[3] ? 'open' : ''}`}
                    onClick={() => handleToggle(3)}
                >
                    <div className="accordion-row">
                        <div className="accordion-icon">
                            <span className="material-symbols-outlined">phone_iphone</span>
                            <label className="accordion-header-text">Compras en Movimiento</label>
                        </div>
                    </div>
                    {isAccordionOpen[3] && (
                        <div className="accordion-body">
                            <p>Disfruta de una experiencia optimizada desde cualquier dispositivo móvil con acceso instantáneo a tu cuenta.</p>
                        </div>
                    )}
                </div>

                {/* Acordeón 5 */}
                <div
                    className={`accordion-item ${isAccordionOpen[4] ? 'open' : ''}`}
                    onClick={() => handleToggle(4)}
                >
                    <div className="accordion-row">
                        <div className="accordion-icon">
                            <span className="material-symbols-outlined">star</span>
                            <label className="accordion-header-text">Recompensas Exclusivas</label>
                        </div>
                    </div>
                    {isAccordionOpen[4] && (
                        <div className="accordion-body">
                            <p>Gana puntos de fidelidad y recibe recompensas especiales por tus compras, además de acceso anticipado a lanzamientos exclusivos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccordionContainer;
