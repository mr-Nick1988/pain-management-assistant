import React, {useState} from "react";
import type {PatientCreation} from "../types/recommendation.ts";
import {useCreatePatientMutation} from "../api/api/apiDoctorSlice.ts";


interface AddPatientProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddPatient: React.FC<AddPatientProps> = ({onClose, onSuccess}) => {

    const [formData, setFormData] = useState<Omit<PatientCreation, 'createdBy'>>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        insurancePolicyNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        additionalInfo: "",
    });
    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const createdBy = localStorage.getItem("userLogin");
        if (!createdBy) {
            console.error("Doctor login not found in localStorage. Cannot create patient.");
            // Optionally, set an error message to display to the user
            return;
        }

        const dataToSend: PatientCreation = {
            ...formData,
            createdBy: createdBy,
        };

        // Convert date from DD.MM.YYYY to YYYY-MM-DD format for Spring LocalDate
        if (dataToSend.dateOfBirth && dataToSend.dateOfBirth.includes('.')) {
            const [day, month, year] = dataToSend.dateOfBirth.split('.');
            if (day && month && year) {
                dataToSend.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }

        if (!dataToSend.additionalInfo?.trim()) {
            delete dataToSend.additionalInfo;
        }

        try {
            await createPatient(dataToSend).unwrap();
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err) {
            console.error("Failed to create patient:", err);
        }
    };

    return (
        <div className="add-patient-modal">
            <div className="add-patient-modal-header">
                <h3>Add New Patient</h3>
                <button className="close-button" onClick={onClose}>X</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input type="text"
                           id="firstName"
                           name="firstName"
                           value={formData.firstName}
                           onChange={handleChange}
                           placeholder="Enter First Name"
                           required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Add Last Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        placeholder="Add Date of Birth"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <input
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        placeholder="Add Gender"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="insurancePolicyNumber">Insurance Policy Number</label>
                    <input
                        id="insurancePolicyNumber"
                        name="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber}
                        onChange={handleChange}
                        placeholder="Add Insurance Policy Number"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Add Phone Number"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Add Email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Add Address"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="additionalInfo">Additional Information</label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        placeholder="Add Additional Information"
                        rows={4}
                    />
                </div>

                {error && (
                    <div className="error-message">
                        Error: {JSON.stringify(error)}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Adding..." : "Add Patient"}
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPatient;