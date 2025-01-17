import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";

// Contexto global para manejar el estado del usuario
const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null); // Estado del usuario actual
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]); // Estado para datos adicionales (ej. wishlist)
    const [error, setError] = useState(null);
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;
    const isFetched = useRef(false); // Referencia para evitar múltiples fetches innecesarios

    // Comprueba si hay un usuario almacenado en localStorage al cargar el componente
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            const token = localStorage.getItem('authToken');
            if (token) {
                fetchUserDetails(); // Obtiene los detalles del usuario si hay un token válido
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    // Obtiene elementos de la wishlist del usuario
    const fetchWishlistItems = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            return data; // Devuelve los datos de la wishlist
        } catch (err) {
            console.error('Error loading wishlist:', err);
        }
    };

    // Almacena el usuario en localStorage cuando cambia
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);


    // Inicia sesión con credenciales proporcionadas
    const login = async (userData) => {
        setError(null);
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/login`, {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json();

            if (response.ok) {
                const usuario = responseData.data;
                setUser(usuario);
                localStorage.setItem("user", JSON.stringify(usuario)); // Guarda usuario en localStorage
                localStorage.setItem('authToken', responseData.token); // Guarda el token
            } else {
                throw new Error(responseData.message || "Error en el servidor");
            }
        } catch (e) {
            setError(e.message || "Error en el servidor");
            console.error('Error en el inicio de sesión:', e);
        }
    };

    // Registra un nuevo usuario
    const register = async (userData) => {
        setError(null);
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/register`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json();

            if (response.ok) {
                const user = responseData.data;
                setUser(user);
                localStorage.setItem("user", JSON.stringify(user)); // Guarda el usuario
                localStorage.setItem('authToken', responseData.token); // Guarda el token
            } else {
                throw new Error(responseData.message || "Error en el registro");
            }
        } catch (e) {
            setError(e.message || "Error en el servidor");
            console.error('Error en el registro:', e);
        }
    };

    // Maneja respuestas de fetch y verifica si hay errores
    const handleFetchResponse = async (response) => {
        if (!response.ok) {
            if (response.status === 401) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                const error = await response.json();
                throw new Error(error.message || "Error en la solicitud.");
            }
        }
        return response.json();
    };

    // Obtiene detalles del usuario autenticado
    const fetchUserDetails = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
    
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await handleFetchResponse(response);
            setUser(data.data); // Actualiza el estado del usuario
            localStorage.setItem("user", JSON.stringify(data.data));
            isFetched.current = true;

        } catch (error) {
            console.error("Error al obtener los detalles del usuario:", error.message);
        }
    };
    
    // Define los valores que estarán disponibles en el contexto
    const value = useMemo(() => ({
        user,
        loading,
        setLoading,
        error,
        login,
        setUser,
        register,
        fetchUserDetails,
        data,
        setData,
        fetchWishlistItems,
    }), [user, loading, error]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// Hook para acceder al contexto de usuario
export function useUser() {
    return useContext(UserContext);
}
