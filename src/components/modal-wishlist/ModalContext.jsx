import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalOpen, setModalOpen] = useState(false); // Estado para controlar si el modal está abierto o cerrado.
    const [activeModal, setActiveModal] = useState(''); // Estado para determinar qué modal está activo actualmente.
    const [overlayVisible, setOverlayVisible] = useState(false); // Estado para mostrar u ocultar el overlay.

    const toggleModal = () => {
        setModalOpen((prev) => !prev); // Alterna el estado del modal entre abierto y cerrado.
    };

    const closeModal = () => {
        setActiveModal(''); // Resetea el modal activo.
        setOverlayVisible(false); // Oculta el overlay.
        setModalOpen(false); // Cierra el modal.
    };

    const openModal = (type) => {
        if (type === 'ModalWishlist' && activeModal !== 'ModalWishlist') {
            setActiveModal('ModalWishlist'); // Activa el modal "ModalWishlist" si no está activo.
            setOverlayVisible(true); // Muestra el overlay.
        } else if (activeModal === type) {
            closeModal(); // Cierra el modal si ya está activo.
        } else {
            setActiveModal(type); // Cambia al nuevo modal especificado.
            setOverlayVisible(true); // Muestra el overlay.
        }
    };

    const value = {
        modalOpen, // Indica si el modal está abierto.
        activeModal, // Contiene el nombre del modal activo.
        overlayVisible, // Controla la visibilidad del overlay.
        toggleModal, // Alterna el estado del modal.
        closeModal, // Cierra el modal y resetea el estado relacionado.
        openModal, // Abre un modal específico y actualiza el estado.
        setModalOpen, // Permite establecer directamente el estado del modal.
    };

    return (
        <ModalContext.Provider value={value}>
             {children} {/* Proporciona el contexto del modal a los componentes hijos. */}
        </ModalContext.Provider>
    );
};
