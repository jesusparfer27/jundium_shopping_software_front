import React, { createContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Contexto para manejar la sesión del usuario
const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const navigate = useNavigate();

    // Verifica la expiración del token periódicamente
    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = localStorage.getItem('authToken');

            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica el token
                if (decodedToken.exp * 1000 < Date.now()) {
                    // Si el token ha expirado, elimina datos del usuario y redirige    
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    // navigate('/error', { state: { tokenExpired: true } });
                }
            } catch (error) {
                // Maneja errores en la decodificación del token
                console.error("Error al decodificar el token:", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                // navigate('/error', { state: { tokenExpired: false } });
            }
        };

        const interval = setInterval(checkTokenExpiration, 60000); // Verifica cada minuto
        return () => clearInterval(interval); // Limpia el intervalo al desmontar
    }, [navigate]);

    return <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>;
};
