// routes.js

import { createBrowserRouter } from "react-router-dom";
import App from '../App';
import { HomePage } from "../pages/HomePage";
import  ProductsPage  from "../pages/ProductsPage";
import { ShowingProductPage } from "../pages/ShowingProduct";
import { CheckOutPage } from "../pages/CheckOutPage";
import { EmailSignIn } from "../pages/EmailSignIn";
import { Profile } from "../pages/Profile";
import { SecondStepSignIn } from '../pages/SecondStepSignIn'
import { Admin } from "../pages/admin_page/Admin";
import { MultifunctionalProductPage } from "../pages/MultifunctionalProductPage";
import { ErrorPage } from "../pages/ErrorPage";

// Crear las rutas
const router = createBrowserRouter([
    {
        path: '/', // Ruta raíz que carga la aplicación principal
        element: <App />,
        errorElement: <ErrorPage />, // Página de error por defecto
        children: [
            { index: true, element: <HomePage /> }, // Página principal
            { path: '/products', element: <ProductsPage /> }, // Página de productos
            { path: '/products/:id', element: <ShowingProductPage /> }, // Página de detalles del producto
            { path: '/check-out', element: <CheckOutPage /> }, // Página de checkout
            { path: '/email-validation', element: <EmailSignIn /> }, // Página de inicio de sesión por email
            { path: '/profile', element: <Profile /> }, // Página del perfil de usuario
            { path: '/email-validation-2', element: <SecondStepSignIn /> }, // Página de segunda validación de email
            { path: '/admin', element: <Admin /> }, // Página de administración
            { path: '/wish-list', element: <MultifunctionalProductPage /> }, // Página de lista de deseos
            { path: '/error', element: <ErrorPage />, errorElement: <ErrorPage /> }, // Página de error personalizada
        ]
    }
]);

export default router;
