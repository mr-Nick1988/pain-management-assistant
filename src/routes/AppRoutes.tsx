import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {AdminPanel, ChangeCredentials, Login, DoctorDashboard, AnesthesiologistDashboard} from "../exports/exports.ts";
import ProtectedRoute from "./ProtectedRoute.tsx";

const AppRoutes: React.FC = () => {

    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminPanel/>
                </ProtectedRoute>
            }/>
            <Route path="/doctor" element={
                <ProtectedRoute>
                    <DoctorDashboard/>
                </ProtectedRoute>
            }/>
            <Route path="/anesthesiologist" element={
                <ProtectedRoute>
                    <AnesthesiologistDashboard/>
                </ProtectedRoute>
            }/>
            <Route path="/change-credentials" element={
                <ProtectedRoute>
                    <ChangeCredentials/>
                </ProtectedRoute>
            }/>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="*" element={<Navigate to="login" replace/>}/>
        </Routes>
    )
};

export default AppRoutes;
