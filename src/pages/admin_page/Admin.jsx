import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ProfileHeader from '../../components/profile-header/ProfileHeader';
import { useUser } from "../../hooks/useUser";
import { Variant } from "./create-products/Variant";
import { Product } from "./create-products/Product";


// Esto es AddVariants
import { AddVariantProductForm } from './add-variants/AddVariantProductForm'
import { AddVariantVariantForm } from './add-variants/AddVariantVariantForm'

// Esto es editProducts
import { EditProduct } from './edit-form/EditProduct'
import { EditVariant } from './edit-form/EditVariant'

import "../../css/pages/admin.css";

export const Admin = () => {
    const [activeSection, setActiveSection] = useState("Add Product");
    const navigate = useNavigate();
    const { user, loading } = useUser();
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [error, setError] = useState("");

    const fetchAdminData = async (token) => {
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error al obtener los datos del admin.");
            }

            const data = await response.json();
            setAdminData(data);
        } catch (err) {
            console.error("Error en fetchAdminData:", err);
            setError("No se pudieron cargar los datos del admin.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserPermissions = async (token) => {
        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/admin`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error al obtener los permisos del usuario: ${response.status}`);
            }

            const userData = await response.json();
            const permissions = userData.permissions;

            if (!permissions) {
                console.error("Permisos no encontrados en los datos del usuario.");
                navigate("/error");
                return;
            }

            console.log("Permisos recibidos:", permissions);

            const allPermissionsGranted = Object.values(permissions).every(permission => permission === true);

            if (allPermissionsGranted) {
                setIsAdmin(true);
                fetchAdminData(token);
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
                        setActiveSection("Add Product");
                    }}
                >
                    Crear Productos
                </button>
                <button
                    className={activeSection === "Add Variant" ? "active" : ""}
                    onClick={() => {
                        console.log("Botón 'Otras Opciones' clicado");
                        setActiveSection("Add Variant");
                    }}
                >
                    Añadir Variantes
                </button>
                <button
                    className={activeSection === "Edit Product" ? "active" : ""}
                    onClick={() => {
                        console.log("Botón 'Otras Opciones' clicado");
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
