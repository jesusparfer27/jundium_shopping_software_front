import { Outlet } from "react-router-dom";
import { HeaderProvider } from "./context/HeaderContext";
import { SessionProvider } from "./hooks/SessionContext";
import Header from "./components/header/Header";
import './css/pages/homepage.css';
import './css/app/app.css';
import Footer from "./components/footer/Footer";
import { useContext } from "react";
import { HeaderContext } from "./context/HeaderContext";
import { ScrollToTop } from "./lib/ScrollToTop";

// Componente principal de la aplicación
function App() {
    return (
        <HeaderProvider> {/* Proporciona el contexto para el Header */}
            <SessionProvider> {/* Proporciona el contexto para la sesión del usuario */}
                <Header />  {/* Componente de cabecera */}
                <MainContent />  {/* Componente que maneja el contenido principal */}
                <Footer />  {/* Componente de pie de página */}
            </SessionProvider>
        </HeaderProvider>
    );
}

// Componente para manejar el contenido principal
function MainContent() {
    const { overlayVisible, activeMenu, handleOverlayClick } = useContext(HeaderContext);  // Obtiene el estado y funciones del HeaderContext

    return (
        <>
            {/* Si overlayVisible es verdadero, muestra un overlay */}
            {overlayVisible && (
                <div
                    className={`overlay ${activeMenu ? 'active' : ''}`}
                    onClick={handleOverlayClick}  // Maneja el click sobre el overlay
                ></div>
            )}

            <div className="mainContent">
                <ScrollToTop />  {/* Asegura que el scroll se reinicie al cambiar de ruta */}
                <Outlet />  {/* Renderiza las rutas hijas (donde se colocan los componentes de cada página) */}
            </div>
        </>
    );
}

export default App;
