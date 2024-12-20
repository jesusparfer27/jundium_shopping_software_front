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

function App() {
    return (
            <HeaderProvider>
        <SessionProvider>

                <Header />
                <MainContent />
                <Footer />
        </SessionProvider>

            </HeaderProvider>
    );
}

function MainContent() {
    const { overlayVisible, activeMenu, handleOverlayClick } = useContext(HeaderContext);

    return (
        <>
            {overlayVisible && (
                <div
                    className={`overlay ${activeMenu ? 'active' : ''}`}
                    onClick={handleOverlayClick}
                ></div>
            )}

            <div className="mainContent">
                <ScrollToTop />
                <Outlet />
            </div>
        </>
    );
}

export default App;
