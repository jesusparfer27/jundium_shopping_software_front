// src/components/ScrollToTop.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Componente que mueve el scroll a la parte superior de la página
export const ScrollToTop = () => {
  const location = useLocation(); // Obtiene la ubicación actual de la ruta

  useEffect(() => {
    window.scrollTo(0, 0); // Resetea el scroll a la parte superior cuando cambia la ruta
  }, [location]); // Se ejecuta cada vez que la ubicación (ruta) cambia

  return null; // No renderiza nada visualmente
};

