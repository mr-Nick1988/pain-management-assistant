import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {AdminPanel, ChangeCredentials, Login, DoctorDashboard, AnesthesiologistDashboard, SearchPatients, RecommendationsList} from "../exports/exports.ts";
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
            <Route path="/doctor/search-patients" element={
                <ProtectedRoute>
                    <SearchPatients/>
                </ProtectedRoute>
            }/>
            <Route path="/doctor/recommendations" element={
                <ProtectedRoute>
                    <RecommendationsList/>
                </ProtectedRoute>
            }/>
            <Route path="/anesthesiologist" element={
                <ProtectedRoute>
                    <AnesthesiologistDashboard/>
                </ProtectedRoute>
            }/>
            <Route path="/change-credentials" element={
                <ProtectedRoute allowedOnFirstLogin={true}>
                    <ChangeCredentials/>
                </ProtectedRoute>
            }/>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="*" element={<Navigate to="login" replace/>}/>
        </Routes>
    )
};

export default AppRoutes;
