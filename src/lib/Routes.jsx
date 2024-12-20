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
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />, // Agregar aquí la página de error
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: '/products', // Aquí se agrega el parámetro de categoría
                element: <ProductsPage />
            },
            {
                path: '/products/:id',
                element: <ShowingProductPage />
            },
            {
                path: '/check-out',
                element: <CheckOutPage />
            },
            {
                path: '/email-validation',
                element: <EmailSignIn />
            },
            {
                path: '/profile',
                element: <Profile />
            },
            {
                path: '/email-validation-2',
                element: <SecondStepSignIn />
            },
            {
                path: '/admin',
                element: <Admin />
            },
            {
                path: '/wish-list',
                element: <MultifunctionalProductPage />
            },
            {
                path: '/error',
                element: <ErrorPage />,
                errorElement: <ErrorPage />,
            }
        ]
    }
]);

export default router;
