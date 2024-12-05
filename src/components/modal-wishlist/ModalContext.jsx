import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState('');
    const [overlayVisible, setOverlayVisible] = useState(false);

    const toggleModal = () => {
        setModalOpen((prev) => !prev);
    };

    const closeModal = () => {
        setActiveModal('');
        setOverlayVisible(false);
        setModalOpen(false);
    };

    const openModal = (type) => {
        if (type === 'ModalWishlist' && activeModal !== 'ModalWishlist') {
            setActiveModal('ModalWishlist');
            setOverlayVisible(true);
        } else if (activeModal === type) {
            closeModal();
        } else {
            setActiveModal(type);
            setOverlayVisible(true);
        }
    };

    const value = {
        modalOpen,
        activeModal,
        overlayVisible,
        toggleModal,
        closeModal,
        openModal,
        setModalOpen,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
