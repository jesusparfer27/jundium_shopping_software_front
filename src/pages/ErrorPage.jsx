import { useLocation } from 'react-router-dom';
import ErrorImage from '../assets/error-image/error-image.jpg';
import { NavLink } from 'react-router-dom';
import '../css/pages/error.css';

export const ErrorPage = () => {
    // Accedemos al estado pasado por navigate
    const location = useLocation();

    // Verificamos si el estado `tokenExpired` está presente en la ubicación. 
    // Este estado podría ser pasado desde otro componente al usar `navigate`.
    const tokenExpired = location.state?.tokenExpired; // Obtener el estado tokenExpired

    return (
        <>
            {/* Sección principal de la página de error */}
            <section>
                <div className="container_errorPage"> {/* Contenedor principal de la página */}

                    {/* Contenedor para la imagen de error */}
                    <div className="container_errorImage">
                        <img className="errorImage_Left" src={ErrorImage} alt="Error" />
                    </div>

                     {/* Contenedor para el mensaje de redirección y botón */}
                    <div className="container_errorRedirection">
                        <div className="block_errorRedirection">

                            {/* Mostramos mensajes diferentes según si la sesión ha expirado */}
                            {tokenExpired ? (
                                <>
                                    <h1 className="errorText_errorPage">¡Tu sesión ha expirado!</h1>
                                    <h1 className="errorText_errorPage">Por favor, vuelve a iniciar sesión.</h1>
                                </>
                            ) : (
                                <>
                                    <h1 className="errorText_errorPage">Ups! ¿Te has equivocado de página?</h1>
                                    <h1 className="errorText_errorPage">No te preocupes puedes volver haciendo click</h1>
                                </>
                            )}
                            <div className="button_errorContainer">
                                <NavLink to={tokenExpired ? "/" : "/"} // Redirigimos siempre al inicio.
                               className="buttonError"> {/* Clase CSS para estilizar el botón.*/ }
                                    {tokenExpired ? "Ir a inicio" : "Ir a inicio"}
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
