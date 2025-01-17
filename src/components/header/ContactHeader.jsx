import React, { useContext, useRef, useState } from 'react';
import { useUser } from '../../hooks/useUser'
import { HeaderContext } from '../../context/HeaderContext';
import '../../css/components/header/header.css';
import '../../css/components/header/contact.css'

const ContactContainer = () => {
    const { activeMenu, closeMenu } = useContext(HeaderContext);
    const contactContainerRef = useRef(null); // Crea una referencia al contenedor de contacto para manipularlo si es necesario
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env

    const { user } = useUser() // Obtiene el usuario autenticado a través de un hook customizado
    console.log(user)
    const [formData, setFormData] = useState({ // Establece el estado inicial del formulario
        name: '',
        email: '',
        content: ''
    });
    const [statusMessage, setStatusMessage] = useState(''); // Estado para manejar los mensajes de éxito o error

    const handleChange = (e) => {
        const { name, value } = e.target; // Obtiene el nombre y valor del campo modificado
        setFormData({ ...formData, [name]: value }); // Actualiza el estado del formulario
    };

    const handleSubmit = async (e) => { 
        e.preventDefault(); // Previene el comportamiento predeterminado del formulario (recarga de página)
        if (!user) {
            setStatusMessage('Usuario no autenticado.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');

            // Realiza la solicitud POST para enviar el formulario al backend
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/support/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia el token en los encabezados de la solicitud
                },
                body: JSON.stringify({
                    user_id: user, // Incluye el ID del usuario autenticado
                    name: formData.name,
                    email: formData.email,
                    content: formData.content
                })
            });
            console.log(formData)

            if (response.ok) { // Si la respuesta del servidor es exitosa
                setStatusMessage('Tu mensaje se envió correctamente.');
                setFormData({ name: '', email: '', content: '' }); // Limpia el formulario después de enviarlo
            } else {
                const errorData = await response.json(); // Obtiene el mensaje de error del servidor
                setStatusMessage(`Error al enviar mensaje: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            setStatusMessage('Hubo un error al enviar tu mensaje. Inténtalo más tarde.');
        }
    };

    return (
        <div
            ref={contactContainerRef}
            className={`contactContainer ${activeMenu === 'contact' ? 'active slideInVertical' : ''}`}
        >
            <div className="contactContainer_responsive">
                <div className="contactContainer_responsiveHeader">
                    <div className="contactContainer_responsiveHeaderContainer">
                        <button className="closeContainer_responsive" onClick={closeMenu}><span className="material-symbols-outlined">
                            close
                         </span></button> {/* Botón para cerrar el menú de contacto */}
                         <h2 className='h2Container_contact'>Contáctenos</h2> {/* Título del formulario de contacto */}
                    </div>
                </div>
                <div className="headerContactContainer">
                    <div className='borderContact'>
                         <div className="contactList"> {/* Lista con métodos de contacto (teléfono, email, dirección) */}
                            <div className="contactItem">
                                <span className="material-symbols-outlined">phone</span>
                                <a href="tel:1234567890">Teléfono: 123-456-7890</a>
                            </div>
                            <div className="contactItem">
                                <span className="material-symbols-outlined">email</span>
                                <a href="mailto:example@example.com">Email: example@example.com</a>
                            </div>
                            <div className="contactItem">
                                <span className="material-symbols-outlined">location_on</span>
                                <a href="#">Dirección: Calle Ejemplo, Ciudad</a>
                            </div>
                        </div>
                    </div>
                    <div className="formContainer">
                        <h1>Mandanos un Email</h1>
                        <form className='formInfo' onSubmit={handleSubmit}>
                            <label htmlFor="name">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name} // Vincula el campo con el estado
                                onChange={handleChange} // Llama a `handleChange` cada vez que cambia el valor
                                required // Hace el campo obligatorio
                                className='inputContact'
                            />
                            <label htmlFor="email">email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className='inputContact'
                            />
                            <label htmlFor="content">Tu mensaje</label>
                            <textarea
                                className='inputContact'
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required></textarea>
                             <button type="submit" className="submitContact_pageButton" onClick={handleSubmit}>Enviar</button> {/* Botón para enviar el formulario */}
                        </form>
                         {statusMessage && <p className="statusMessage">{statusMessage}</p>} {/* Muestra el mensaje de estado (éxito o error) */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactContainer;
