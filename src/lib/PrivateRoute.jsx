// Componente para proteger rutas privadas
import { Navigate } from "react-router-dom";

// Redirige a la validación de email si el usuario no está autenticado
const PrivateRoute = ({ element, isAuthenticated }) => {
    return isAuthenticated ? element : <Navigate to="/email-validation" replace />;
};

export default PrivateRoute;
