import React, {useState} from "react";
import type {PatientCreation} from "../types/recommendation.ts";
import {useCreatePatientMutation} from "../features/api/apiDoctorSlice.ts";


interface AddPatientProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddPatient: React.FC<AddPatientProps> = ({onClose, onSuccess}) => {

    const [formData, setFormData] = useState<PatientCreation>({
        firstName: "",
        lastName: "",
        emrNumber: "",
        additionalInfo: ""
    });
    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createPatient(formData).unwrap();
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
                    <label htmlFor="emrNumber">EMR Number</label>
                    <input
                        id="emrNumber"
                        name="emrNumber"
                        value={formData.emrNumber}
                        onChange={handleChange}
                        placeholder="Add EMR Number"
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