import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {type Patient, PatientsGenders} from "../../types/doctor";
import {useCreatePatientMutation} from "../../api/api/apiDoctorSlice.ts";
import {getErrorMessage} from "../../utils/getErrorMessageHelper.ts";
import {Button, Card, CardContent, CardHeader,  Input, Label, Select, PageNavigation} from "../ui";
import {validatePatient} from "../../utils/validationPatient";


const PatientFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const [form, setForm] = useState<Patient>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: PatientsGenders.MALE,
        insurancePolicyNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        additionalInfo: "",
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация формы
        const validationErrors = validatePatient(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            const createdPatient = await createPatient(form).unwrap();
            navigate(`/doctor/emr-form/${createdPatient.mrn}`);
        } catch {
            // Ошибка отобразится условным рендером
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Register New Patient</h2>
                    </div>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Enter patient's first name"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                        </div>

                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Enter patient's last name"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />
                            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                        </div>

                        <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                value={form.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                            {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                id="gender"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select patient's gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
                            <Input
                                id="insurancePolicyNumber"
                                name="insurancePolicyNumber"
                                placeholder="Enter insurance policy number"
                                value={form.insurancePolicyNumber}
                                onChange={handleChange}
                                required
                            />
                            {errors.insurancePolicyNumber && <p className="text-sm text-red-500 mt-1">{errors.insurancePolicyNumber}</p>}
                        </div>

                        <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Enter patient's phone number"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                            {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter patient's email address"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Enter patient's full address"
                                value={form.address}
                                onChange={handleChange}
                                required
                            />
                            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                        </div>

                        <div>
                            <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                            <Input
                                id="additionalInfo"
                                name="additionalInfo"
                                placeholder="Enter any additional information"
                                value={form.additionalInfo}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="isActive">Treatment Status</Label>
                            <Select
                                id="isActive"
                                name="isActive"
                                value={form.isActive ? "true" : "false"}
                                onChange={(e) =>
                                    setForm(prev => ({...prev, isActive: e.target.value === "true"}))
                                }
                                required
                            >
                                <option value="" disabled>Select treatment status</option>
                                <option value="true">Under Treatment</option>
                                <option value="false">Not Under Treatment</option>
                            </Select>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="cancel"
                                onClick={() => navigate("/doctor")}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="approve"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Registering..." : "Register & Create EMR"}
                            </Button>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center">
                                {getErrorMessage(error) || "Error registering patient"}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
            <PageNavigation />
        </div>
    );
};

export default PatientFormRegister;
