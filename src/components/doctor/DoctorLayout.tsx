import React from "react";
import { Outlet } from "react-router-dom";

const DoctorLayout: React.FC = () => {
    return (
        <div className="medical-page">
            <div className="medical-container">
                <Outlet />
            </div>
        </div>
    );
};

export default DoctorLayout;
