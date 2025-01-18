import React, { useState, useEffect, useContext } from "react"; // Importa los hooks de React para manejar el estado, los efectos y el contexto
import { useNavigate } from "react-router-dom"; // Hook para redirigir al usuario a otras rutas

// Importación de componentes relacionados con la administración de productos
import ProfileHeader from '../../components/profile-header/ProfileHeader';
import { useUser } from "../../hooks/useUser"; // Hook personalizado para obtener los datos del usuario
import { Variant } from "./create-products/Variant"; // Componente para gestionar variantes de productos
import { Product } from "./create-products/Product"; // Componente para gestionar productos

// Importación de componentes para agregar variantes de productos
import { AddVariantProductForm } from './add-variants/AddVariantProductForm'; 
import { AddVariantVariantForm } from './add-variants/AddVariantVariantForm';

// Importación de componentes para editar productos
import { EditProduct } from './edit-form/EditProduct'; 
import { EditVariant } from './edit-form/EditVariant';

import { ProductContext } from "./context/ProductContext";
import "../../css/pages/admin.css"; // Estilos CSS específicos para la página de administración

// Componente principal para la página de administración
export const Admin = () => {
    // Definición de estados locales para manejar la sección activa, carga, permisos, datos del administrador y errores
    const [activeSection, setActiveSection] = useState("Add Product"); // Sección activa de la UI
    const navigate = useNavigate(); // Hook de navegación para redirigir a otras rutas
    const { user, loading } = useUser(); // Datos del usuario desde un hook personalizado
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env; // Variables de entorno para la API
    const [isLoading, setIsLoading] = useState(true); // Estado de carga
    const [isAdmin, setIsAdmin] = useState(false); // Estado que determina si el usuario es administrador
    const [adminData, setAdminData] = useState(null); // Datos del administrador
    const [error, setError] = useState(""); // Manejo de errores

    const { resetProductState } = useContext(ProductContext); // Contexto para resetear el estado de los productos

    // Función para obtener los datos del administrador desde el backend
    const fetchAdminData = async (token) => {
        try {
            // Realiza una solicitud al endpoint de datos del administrador
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Si la respuesta no es exitosa, lanza un error
            if (!response.ok) {
                throw new Error("Error al obtener los datos del admin.");
            }

            // Si es exitosa, se parsea la respuesta JSON y se actualiza el estado de adminData
            const data = await response.json();
            setAdminData(data);
        } catch (err) {
            console.error("Error en fetchAdminData:", err);
            setError("No se pudieron cargar los datos del admin.");
        } finally {
            setIsLoading(false); // Termina el proceso de carga
        }
    };

    // Función para verificar los permisos del usuario
    const fetchUserPermissions = async (token) => {
        try {
            // Realiza una solicitud para obtener los permisos del usuario
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/admin`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Si la respuesta no es exitosa, lanza un error
            if (!response.ok) {
                throw new Error(`Error al obtener los permisos del usuario: ${response.status}`);
            }

            // Parsear la respuesta y verificar si tiene permisos completos
            const userData = await response.json();
            const permissions = userData.permissions;   

            if (!permissions) {
                console.error("Permisos no encontrados en los datos del usuario.");
                navigate("/error"); // Redirige a la página de error si no tiene permisos
                return;
            }

            console.log("Permisos recibidos:", permissions);

            // Verifica si todos los permisos son verdaderos
            const allPermissionsGranted = Object.values(permissions).every(permission => permission === true);

            if (allPermissionsGranted) {
                setIsAdmin(true); // Si tiene todos los permisos, se establece como administrador
                fetchAdminData(token); // Obtiene los datos del administrador
            } else {
                console.warn("El usuario no tiene permisos administrativos completos.");
                navigate("/error");
            }
        } catch (err) {
            console.error("Error al obtener permisos:", err);
            navigate("/error");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            console.error("No se encontró un token de autenticación.");
            navigate("/login");
            return;
        }

        fetchUserPermissions(token);
    }, [navigate, VITE_API_BACKEND, VITE_BACKEND_ENDPOINT]);

    // Depuración: Verificar el valor de activeSection
    useEffect(() => {
        console.log("Sección activa:", activeSection);
    }, [activeSection]);

    return (
        <div className="container_adminContainer">
            <ProfileHeader initials="ADMIN" />

            {/* Botones de navegación */}
            <nav className="admin-nav">
                <button
                    className={activeSection === "Add Product" ? "active" : ""}
                    onClick={() => {
                        console.log("Botón 'Crear Productos' clicado");
                        resetProductState();
                        setActiveSection("Add Product");
                    }}
                >
                    Crear Productos
                </button>
                <button
                    className={activeSection === "Add Variant" ? "active" : ""}
                    onClick={() => {
                        console.log("Botón 'Otras Opciones' clicado");
                        resetProductState();
                        setActiveSection("Add Variant");
                    }}
                >
                    Añadir Variantes
                </button>
                <button
                    className={activeSection === "Edit Product" ? "active" : ""}
                    onClick={() => {
                        console.log("Botón 'Otras Opciones' clicado");
                        resetProductState();
                        setActiveSection("Edit Product");
                    }}
                >
                    Editar Productos
                </button>
            </nav>

            {/* Renderizado condicional: Solo muestra la sección si se selecciona una */}
            <div className="admin-content">
                <div className="admin-section">
                    {activeSection === "Add Product" && (
                        <>
                        {/* <div className="other-section"> */}
                            <Product />
                            <Variant />
                            </>
                            
                    )}
                    {activeSection === "Add Variant" && (
                        <>
                        <AddVariantProductForm />
                        <AddVariantVariantForm />
                        </>
                    )}
                    {activeSection === "Edit Product" && (
                        <>
                        <EditProduct />
                        <EditVariant />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
