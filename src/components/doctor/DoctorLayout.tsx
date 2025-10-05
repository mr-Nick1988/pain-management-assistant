import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

const DoctorLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="medical-page">
            <div className="medical-container">
                <header className="mb-8">
                    <h1 className="medical-title">Doctor Panel</h1>
                    <p className="medical-text text-gray-600">Manage patients, view recommendations, and approve treatments</p>
                </header>

                {/* Navigation Buttons */}
                <div className="medical-card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/doctor')}
                            className="medical-btn medical-btn-primary"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/doctor/register-patient')}
                            className="medical-btn medical-btn-success"
                        >
                            Register Patient
                        </button>
                        <button
                            onClick={() => navigate('/doctor/patients-list')}
                            className="medical-btn medical-btn-primary"
                        >
                            Patients List
                        </button>
                        <button
                            onClick={() => navigate('/doctor/recommendations')}
                            className="medical-btn medical-btn-secondary"
                        >
                            Pending Recommendations
                        </button>
                    </div>
                </div>

                {/* Outlet для вложенных маршрутов */}
                <div className="mt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DoctorLayout;
