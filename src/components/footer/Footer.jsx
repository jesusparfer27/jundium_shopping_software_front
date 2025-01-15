import React, { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import '../../css/components/footer/footer.css';
import { useUser } from '../../hooks/useUser';
import logoJundiumWhite from '../../assets/logos/jundium_white_letters.png'
import logoJundiumBlack from '../../assets/logos/jundium_black_letters.png'


// Usa useLocation en el contenedor footer y con isHomeOrWomenCollection
// defino que ruta me interesa para que reciban unos estilos u otros
const Footer = () => {
    const location = useLocation();
    const isHomeOrWomenCollection = location.pathname === '/' || location.pathname === '/woman-collection';
    
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [isInputActive, setIsInputActive] = useState(false);
    const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env

    const { user } = useUser();
    const loggedUser = JSON.parse(localStorage.getItem('user')) || {};
    const loggedUserEmail = loggedUser.email || '';
    console.log('Usuario desde useUser:', user);

    // handleInputChange sirve para formatear los valores del input
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setEmail(newValue);
        setIsInputActive(newValue !== '');
        setMessage(null);
    };

const handleSubscribe = async () => {
    console.log("Función handleSubscribe llamada");
    console.log(localStorage.getItem('user'));

    // si no hay un correo muestra el mensaje
    if (!email) {
        setMessage(
            <span>
                Inserta una dirección válida
            </span>
        );
        return;
    }

    console.log("Email ingresado:", email);
    console.log("Usuario logueado con correo:", user.email);

    // exige un usuario loggeado
    if (!loggedUser && !user) {
        setMessage(
          <span>
            No estás logueado. Por favor, <NavLink to="/login">inicia sesión</NavLink>.
          </span>
        );
        return;
      }
      
    // exige un usuario creado
    if (email !== loggedUserEmail) {
        setMessage(
            <span>
                Debes registrarte antes <NavLink to="/email-signin">aquí</NavLink>.
            </span>
        );
        return;
    }
    console.log(loggedUserEmail)

    // Si el usuario se encuentro loggeado recibe el token del localStorage
    try {
        const token = localStorage.getItem('authToken');
        
        console.log("Usuario logueado detectado con token:", token);
        console.log("Correo enviado al parámetro:", email);

        //  Envía la info el input al la ruta de mi API con el endpoint /newsletter y el método POST
        const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/newsletter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Convierte el body de la solicitud en un String
            body: JSON.stringify({ email })
        });

        // El resultado lo convierte a json
        const result = await response.json();
        if (response.ok && result.success) {
            setMessage("Éxito al suscribirse a la newsletter");
            // depuracióon por si ha habido un error en la subscripción
        } else {
            setMessage(result.message || "Error en la suscripción.");
        }
        // depuracióon por si ha habido un error durante el proceso de la subscripción
    } catch (error) {
        setMessage("Error al suscribir a la newsletter.");
        console.error("Error al suscribir a la newsletter:", error);
    }
};

    // Llama a un logo u otro dependiendo de en que ruta se encuentre el footer
    const logoSrc = isHomeOrWomenCollection ? logoJundiumBlack : logoJundiumWhite;

    return (
        // Si la ruta es la definida en isHomeOrWomenCollection recibirá footer-light
        //  y de lo contrario footer-dark
        <footer className={isHomeOrWomenCollection ? 'footer-light' : 'footer-dark'}>
            <div className="footerSuperior">
                <div className="footerLinksContainer">
                    <div className="footerSection">
                        <strong>Acerca de Nosotros</strong>
                        <nav className="linksSections">
                            <a href="#about-us">Quiénes Somos</a>
                            <a href="#careers">Carreras</a>
                            <a href="#press">Prensa</a>
                        </nav>
                    </div>
                    <div className="footerSection">
                        <strong>Soporte</strong>
                        <nav className="linksSections">
                            <a href="#help-center">Centro de Ayuda</a>
                            <a href="#contact-us">Contáctanos</a>
                            <a href="#faq">Preguntas Frecuentes</a>
                        </nav>
                    </div>
                    <div className="footerSection">
                        <strong>Redes Sociales</strong>
                        <nav className="linksSections">
                            <a href="#facebook">Facebook</a>
                            <a href="#twitter">Twitter</a>
                            <a href="#instagram">Instagram</a>
                        </nav>
                    </div>
                </div>

                <div className="footerSubscriptionContainer">
                    <p>Suscríbete a nuestro boletín para recibir actualizaciones</p>
                    <div className="subscriptionInputContainer">
                        <input
                            type="text"
                            className={`input_subscribeNewsletter ${isInputActive ? 'active' : ''}`}
                            placeholder="Introduce tu correo electrónico"
                            // Se agrega el valor al estado email
                            value={email}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleSubscribe}>Suscribirse</button>
                    </div>
                    {message && <span className="subscriptionMessage">{message}</span>}
                    <strong>¡Mantente informado!</strong>
                    <div className="socialLinks">
                        <a href="#facebook" title="Facebook">
                            <span className="material-icons">facebook</span>
                        </a>
                        <a href="#twitter" title="Twitter">
                            <span className="material-icons">twitter</span>
                        </a>
                        <a href="#instagram" title="Instagram">
                            <span className="material-icons">instagram</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="footerInferior">
                <div className="footerBottomRow">
                    <div><img src={logoSrc} alt="Jundium Logo" className="footerLogo" /></div>
                    <p>Déjanos tus comentarios y sugerencias</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
