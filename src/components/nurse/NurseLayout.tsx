import React from "react";
import { Outlet } from "react-router-dom";

const NurseLayout: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Nurse Panel</h1>

            {/* Здесь можно добавить sidebar / navbar / buttons */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <p> Some text or some picture </p>
            </div>

            {/* Тут будут подставляться дочерние маршруты */}
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
};

export default NurseLayout;