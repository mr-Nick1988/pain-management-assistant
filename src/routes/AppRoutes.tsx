import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {
    AdminPanel,
    ChangeCredentials,
    Login,
    DoctorDashboard,
    AnesthesiologistDashboard,
    SearchPatients,
    RecommendationsList,
    CreatePerson,
    PatientsList,
    NurseDashboard,
    PatientFormRegister,
    EMRFormRegister,
    EMRUpdateForm,
    PatientList,
    PatientDetails,
    VASFormRegister,
    GenerateRecommendationForm,
    PatientUpdateForm,
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
            <Route path="/doctor/patients-list" element={
                <ProtectedRoute>
                    <PatientsList/>
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