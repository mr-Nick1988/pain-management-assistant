import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {
    UsersManagement,
    AdminLayout,
    AdminDashboard,
    AnalyticsOverview,
    UserActivityMonitor,
    PerformanceMetrics,
    PatientStatistics,
    TechnicalLogs,
    EventsTimeline,
    ChangeCredentials,
    AnesthesiologistDashboard,
    CreatePerson,
    DoctorDashboard,
    DoctorEMRFormRegister,
    DoctorEMRUpdateForm,
    DoctorPatientDetails,
    DoctorPatientFormRegister,
    DoctorPatientList,
    DoctorQuickSearch,
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
    VASFormRegister,
    RecommendationDetails,
    NurseRecommendationsList,
    ImportPatientFromFHIR,
    PatientSyncDashboard,
    ApiKeyManagement,
    ExternalVasMonitor,
    AnesthesiologistLayout,
    AnesthesiologistEscalationList,
    AnesthesiologistRejectedList,
    AnesthesiologistRecommendationDetails,
    AnesthesiologistRecommendationUpdateForm,
    AnesthesiologistRecommendationCreateForm,
    VasDeviceSimulator,
    ReportingDashboard,
    BackupDashboard

} from "../exports/exports.ts";
import ProtectedRoute from "./ProtectedRoute.tsx";


const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            
            {/* ADMIN ROUTES */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard/>}/>
                <Route path="analytics" element={<AnalyticsOverview/>}/>
                <Route path="users" element={<UsersManagement/>}/>
                <Route path="activity" element={<UserActivityMonitor/>}/>
                <Route path="performance" element={<PerformanceMetrics/>}/>
                <Route path="patients-stats" element={<PatientStatistics/>}/>
                <Route path="logs" element={<TechnicalLogs/>}/>
                <Route path="events" element={<EventsTimeline/>}/>
                <Route path="create-person" element={<CreatePerson/>}/>
                <Route path="api-keys" element={<ApiKeyManagement/>}/>
                <Route path="reporting" element={<ReportingDashboard/>}/>
                <Route path="backup" element={<BackupDashboard/>}/>
            </Route>

            {/* NURSE ROUTES */}
            <Route path="/nurse" element={
                <ProtectedRoute>
                    <NurseLayout/> {/*Тут присутсвует <Outlet> для подстановки подкомпоненты и отрисовки её*/}
                </ProtectedRoute>
            }>
                <Route index element={<NurseDashboard/>}/> {/* стартовая страница */}
                <Route path="register-patient" element={<PatientFormRegister/>}/>
                <Route path="recommendations" element={<NurseRecommendationsList />}/>
                <Route path="emr-form/:mrn" element={<EMRFormRegister/>}/>
                <Route path="emr-update/:mrn" element={<EMRUpdateForm/>}/>
                <Route path="patients" element={<PatientList/>}/>
                <Route path="patient/:mrn" element={<PatientDetails/>}/>
                <Route path="vas-form/:mrn" element={<VASFormRegister/>}/>
                <Route path="recommendation/:mrn" element={<GenerateRecommendationForm/>}/>
                <Route path="recommendation-details/:mrn" element={<RecommendationDetails/>}/>
                <Route path="update-patient/:mrn" element={<PatientUpdateForm/>}/>
                <Route path="import-patient" element={<ImportPatientFromFHIR/>}/>
                <Route path="patient-sync" element={<PatientSyncDashboard/>}/>
                <Route path="external-vas-monitor" element={<ExternalVasMonitor/>}/>
                <Route path="vas-simulator" element={<VasDeviceSimulator/>}/>
            </Route>

            {/* DOCTOR ROUTES */}
            <Route path="/doctor" element={
                <ProtectedRoute>
                    <DoctorLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<DoctorDashboard/>}/>
                <Route path="register-patient" element={<DoctorPatientFormRegister/>}/>
                <Route path="emr-form/:mrn" element={<DoctorEMRFormRegister/>}/>
                <Route path="emr-update/:mrn" element={<DoctorEMRUpdateForm/>}/>
                <Route path="patients-list" element={<DoctorPatientList/>}/>
                <Route path="quick-search" element={<DoctorQuickSearch/>}/>
                <Route path="patient/:mrn" element={<DoctorPatientDetails/>}/>
                <Route path="update-patient/:mrn" element={<DoctorPatientUpdateForm/>}/>
                <Route path="recommendations" element={<DoctorRecommendationList/>}/>
                <Route path="recommendations/recommendation/:mrn" element={<DoctorRecommendationDetails/>}/>
            </Route>

            {/* ANESTHESIOLOGIST ROUTES */}
            <Route path="/anesthesiologist" element={
                <ProtectedRoute>
                    <AnesthesiologistLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<AnesthesiologistDashboard/>}/>
                <Route path="escalations" element={<AnesthesiologistEscalationList/>}/>
                <Route path="rejected" element={<AnesthesiologistRejectedList/>}/>
                <Route path="recommendation/details/:mrn" element={<AnesthesiologistRecommendationDetails/>}/>
                <Route path="recommendation/update/:mrn" element={<AnesthesiologistRecommendationUpdateForm/>}/>
                <Route path="recommendation/create/:mrn" element={<AnesthesiologistRecommendationCreateForm/>}/>
            </Route>

            <Route path="/change-credentials" element={
                <ProtectedRoute allowedOnFirstLogin={true}>
                    <ChangeCredentials/>
                </ProtectedRoute>
            }/>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
    )
};

export default AppRoutes;