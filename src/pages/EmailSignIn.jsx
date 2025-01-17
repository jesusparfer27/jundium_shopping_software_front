import React, { useState, useEffect } from 'react';
import '../css/pages/emailsignin.css';
import AccordionContainer from '../components/signin/AccordionContainer';
import { useNavigate } from 'react-router-dom';

export const EmailSignIn = () => {
    const navigate = useNavigate();
    // Estado para manejar si cada acordeón está abierto o cerrado.
    const [isAccordionOpen, setIsAccordionOpen] = useState([false, false, false, false, false, false, false, false]);
    // Estado para almacenar datos obtenidos de la API.
    const [apiData, setApiData] = useState(null);
    // Estado para los valores del email y su confirmación.
    const [email, setEmail] = useState('');
    const [emailConfirm, setEmailConfirm] = useState('');
    // Estado para verificar si el email ya existe en la base de datos.
    const [emailExists, setEmailExists] = useState(false);
    // Estado para rastrear si se intentó enviar el formulario.
    const [submitAttempted, setSubmitAttempted] = useState(false);
    // Estado para verificar si el email es obligatorio pero está vacío.
    const [emailRequired, setEmailRequired] = useState(false);
    // Variables de entorno para las URLs de la API.
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env;

    // Función para alternar el estado abierto/cerrado de un acordeón según el índice.
    const toggleAccordion = (index) => {
        const updatedState = [...isAccordionOpen]; // Copiamos el estado actual.
        updatedState[index] = !updatedState[index]; // Cambiamos el estado del acordeón seleccionado.
        setIsAccordionOpen(updatedState); // Actualizamos el estado.
    };

    // useEffect para obtener datos de la API al montar el componente.
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Petición a la API para obtener datos de usuarios.
                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/users`);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la API'); // Manejo de errores en la respuesta.
                }
                const data = await response.json(); // Convertimos la respuesta a JSON.
                setApiData(data.data); // Guardamos los datos obtenidos en el estado.
            } catch (error) {
                console.error("Error al obtener datos:", error.message);
            }
        };

        fetchData(); // Llamamos a la función al montar el componente.
    }, [VITE_API_BACKEND, VITE_BACKEND_ENDPOINT]); // Dependencias para volver a ejecutar el efecto si cambian.

    // Función para manejar cambios en el campo de email.
    const handleEmailChange = (event) => {
        setEmail(event.target.value); // Actualizamos el valor del email.
        setEmailExists(false); // Reiniciamos el estado de existencia del email.
        setEmailRequired(false); // Reiniciamos el estado de email requerido.
        setSubmitAttempted(false); // Reiniciamos el intento de envío.
    };

    // Función para manejar cambios en el campo de confirmación de email.
    const handleEmailConfirmChange = (event) => {
        setEmailConfirm(event.target.value);
        // Limpiar errores relacionados con la coincidencia de emails
        setSubmitAttempted(false); // Reiniciamos el intento de envío.
    };

    // Función para validar el formato del email utilizando una expresión regular.
    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón de validación.
        return emailPattern.test(email); // Retorna true si el email es válido.
    };

    // Función para manejar el envío del formulario.
    const handleSubmit = async () => {
        setSubmitAttempted(true); // Indicamos que se intentó enviar el formulario.

        if (!email) { // Validamos si el campo de email está vacío.
            setEmailRequired(true); // Mostramos un error indicando que es obligatorio.
            return; // Salimos de la función.
        }

        if (!validateEmail(email)) { // Validamos el formato del email.
            setEmailExists(false); // Reiniciamos el estado de existencia del email.
            return; // Salimos de la función.
        }

        if (email === emailConfirm) { // Verificamos si el email coincide con su confirmación.
            if (apiData) { // Si los datos de la API están disponibles.
                // Verificamos si el email ya existe en los datos obtenidos.
                const exists = apiData.some(user => user.email === email);
                setEmailExists(exists); // Actualizamos el estado de existencia.

                if (!exists) { // Si el email no existe.
                    localStorage.setItem('userEmail', email); // Guardamos el email en localStorage.
                    navigate('/email-validation-2'); // Redirigimos al usuario a la siguiente página.
                }
            }
        } else {
            setEmailExists(false); // Reiniciamos el estado si los emails no coinciden.
        }
    };

    return (
        <section className="email-signin-section">
            <div className="main-content">
                <div className="form-button-container">
                    <div className="first-container">
                        <div className="insert-email">
                            <div className="email-group">
                                <label className="email-label">Email</label>
                                <div className="email-input">
                                    <input
                                        type="text"
                                        placeholder="Introduce tu email"
                                        value={email}
                                        onChange={handleEmailChange}
                                    />
                                </div>
                                {emailRequired && (
                                    <p className="errorMessage_signIn_top">El email es obligatorio.</p>
                                )}
                                <label className="email-validation-label">Confirmar Email</label>
                                <div className="email-validation-input">
                                    <input
                                        type="text"
                                        placeholder="Confirma tu email"
                                        value={emailConfirm}
                                        onChange={handleEmailConfirmChange}
                                    />
                                </div>
                                {emailExists && (
                                    <p className="errorMessage_signIn">Este email ya está registrado</p>
                                )}
                                {submitAttempted && email !== emailConfirm && (
                                    <p className="errorMessage_signIn">Los emails no coinciden.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="submit-button-container">
                        <button
                            className="submit-button-emailValidation"
                            onClick={handleSubmit}
                        >
                            Enviar
                        </button>
                    </div>
                </div>

                <AccordionContainer
                    isAccordionOpen={isAccordionOpen}
                    toggleAccordion={toggleAccordion}
                />
            </div>
        </section>
    );
};

export default EmailSignIn;
