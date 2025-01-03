import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ data, setData ] = useState([])
    const [error, setError] = useState(null);
    const {VITE_API_BACKEND, VITE_BACKEND_ENDPOINT} = import.meta.env;
    const isFetched = useRef(false);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            const token = localStorage.getItem('authToken');
            if (token) {
                fetchUserDetails();
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

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
            return data;
        } catch (err) {
            console.error('Error loading wishlist:', err);
        }
    };

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);


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
                localStorage.setItem("user", JSON.stringify(usuario));
                localStorage.setItem('authToken', responseData.token);
            } else {
                throw new Error(responseData.message || "Error en el servidor");
            }
        } catch (e) {
            setError(e.message || "Error en el servidor");
            console.error('Error en el inicio de sesión:', e);
        }
    };

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
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem('authToken', responseData.token);
            } else {
                throw new Error(responseData.message || "Error en el registro");
            }
        } catch (e) {
            setError(e.message || "Error en el servidor");
            console.error('Error en el registro:', e);
        }
    };

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
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            isFetched.current = true;

        } catch (error) {
            console.error("Error al obtener los detalles del usuario:", error.message);
        }
    };
    

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

export function useUser() {
    return useContext(UserContext);
}
