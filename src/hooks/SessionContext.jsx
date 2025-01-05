import React, { createContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // navigate('/');
                return;
            }

            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    navigate('/error', { state: { tokenExpired: true } });
                }
            } catch (error) {
                console.error("Error al decodificar el token:", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                navigate('/error', { state: { tokenExpired: false } });
            }
        };

        const interval = setInterval(checkTokenExpiration, 60000); // Verifica cada minuto
        return () => clearInterval(interval);
    }, [navigate]);

    return <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>;
};
