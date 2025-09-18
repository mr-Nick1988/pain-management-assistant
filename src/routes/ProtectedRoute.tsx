import React from "react";
import {Navigate} from "react-router-dom";


interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {

    // Проверяем наличие роли пользователя вместо токена
    const userRole = localStorage.getItem("userRole");
    const isAuth = userRole !== null;
    
    if (!isAuth) {
        return <Navigate to="/login" replace/>;
    }
    return <>{children}</>;
}

export default ProtectedRoute;