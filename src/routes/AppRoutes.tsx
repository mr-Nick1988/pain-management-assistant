import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
    AdminPanel,
    ChangeCredentials,
    AnesthesiologistDashboard,
    CreatePerson,
    DoctorDashboard,
    DoctorEMRFormRegister,
    DoctorEMRUpdateForm,
    DoctorPatientDetails,
    DoctorPatientFormRegister,
    DoctorPatientList,
    DoctorPatientUpdateForm,
    DoctorRecommendationDetails,
    DoctorRecommendationList,
    DoctorLayout,
    EMRFormRegister,
    EMRUpdateForm,
    GenerateRecommendationForm,
    Login,
    NurseDashboard,
    NurseLayout,
    PatientDetails,
    PatientFormRegister,
    PatientList,
    PatientUpdateForm,
    VASFormRegister
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

            <Route path="/admin/create-person" element={
                <ProtectedRoute>
                    <CreatePerson/>
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
                <Route path="emr-form/:mrn" element={<EMRFormRegister />} />
                <Route path="emr-update/:mrn" element={<EMRUpdateForm />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="patient/:mrn" element={<PatientDetails />} />
                <Route path="vas-form/:mrn" element={<VASFormRegister />} />
                <Route path="recommendation/:mrn" element={<GenerateRecommendationForm />} />
                <Route path="update-patient/:mrn" element={<PatientUpdateForm />} />
            </Route>

            {/* DOCTOR ROUTES */}
            <Route path="/doctor" element={
                <ProtectedRoute>
                    <DoctorLayout />
                </ProtectedRoute>
            }>
                <Route index element={<DoctorDashboard />} />
                <Route path="register-patient" element={<DoctorPatientFormRegister />} />
                <Route path="emr-form/:mrn" element={<DoctorEMRFormRegister />} />
                <Route path="emr-update/:mrn" element={<DoctorEMRUpdateForm />} />
                <Route path="patients-list" element={<DoctorPatientList />} />
                <Route path="patient/:mrn" element={<DoctorPatientDetails />} />
                <Route path="update-patient/:mrn" element={<DoctorPatientUpdateForm />} />
                <Route path="recommendations" element={<DoctorRecommendationList />} />
                <Route path="recommendation/:mrn" element={<DoctorRecommendationDetails />} />
            </Route>

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