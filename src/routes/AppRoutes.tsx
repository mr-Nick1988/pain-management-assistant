import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {
    AdminPanel,
    ChangeCredentials,
    Login,
    DoctorDashboard,
    AnesthesiologistDashboard,
    NurseDashboard,
    PatientFormRegister,
    EMRFormRegister,
    EMRUpdateForm,
    PatientList,
    PatientDetails,
    VASFormRegister,
    GenerateRecommendationForm, PatientUpdateForm,
    NurseLayout,
} from "../exports/exports.ts";
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
            {/* NURSE ROUTES */}
            <Route path="/nurse" element={
                <ProtectedRoute>
                    <NurseLayout />   {/*Тут присутсвует <Outlet> для подстановки подкомпоненты и отрисовки её*/}
                </ProtectedRoute>
            }>
                <Route index element={<NurseDashboard />} /> {/* стартовая страница */}
                <Route path="register-patient" element={<PatientFormRegister />} />
                <Route path="emr-form/:personId" element={<EMRFormRegister />} />
                <Route path="emr-update/:personId" element={<EMRUpdateForm />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="patient/:personId" element={<PatientDetails />} />
                <Route path="vas-form/:personId" element={<VASFormRegister />} />
                <Route path="recommendation/:personId" element={<GenerateRecommendationForm />} />
                <Route path="update-patient/:personId" element={<PatientUpdateForm />} />
            </Route>

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
