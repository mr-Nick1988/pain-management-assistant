import type {Patient} from "../types/common/types";

export const validatePatient = (form: Partial<Patient>, isRequired: boolean = true): Record<string, string> => {
    const errors: Record<string, string> = {};

    // First Name validation (REQUIRED)
    if (isRequired && (!form.firstName || form.firstName.trim().length === 0)) {
        errors.firstName = "First name is required";
    } else if (form.firstName && (form.firstName.trim().length < 2 || form.firstName.trim().length > 50)) {
        errors.firstName = "First name must be between 2 and 50 characters";
    }

    // Last Name validation (REQUIRED)
    if (isRequired && (!form.lastName || form.lastName.trim().length === 0)) {
        errors.lastName = "Last name is required";
    } else if (form.lastName && (form.lastName.trim().length < 2 || form.lastName.trim().length > 50)) {
        errors.lastName = "Last name must be between 2 and 50 characters";
    }

    // Date of Birth validation (REQUIRED)
    if (isRequired && (!form.dateOfBirth || form.dateOfBirth.trim().length === 0)) {
        errors.dateOfBirth = "Date of birth is required";
    } else if (form.dateOfBirth) {
        const birthDate = new Date(form.dateOfBirth);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 120); // Max age 120 years

        if (birthDate > today) {
            errors.dateOfBirth = "Date of birth cannot be in the future";
        } else if (birthDate < minDate) {
            errors.dateOfBirth = "Date of birth is too far in the past";
        }
    }

    // Phone Number validation (REQUIRED)
    if (isRequired && (!form.phoneNumber || form.phoneNumber.trim().length === 0)) {
        errors.phoneNumber = "Phone number is required";
    } else if (form.phoneNumber) {
        const phoneRegex = /^[\d\s\-+()]{7,20}$/;
        if (!phoneRegex.test(form.phoneNumber)) {
            errors.phoneNumber = "Phone number must be 7-20 digits (can include +, -, spaces, parentheses)";
        }
    }

    // Email validation (OPTIONAL, but if provided must be valid)
    if (form.email && form.email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.email = "Please enter a valid email address";
        }
    }

    // Insurance Policy Number validation (REQUIRED)
    if (isRequired && (!form.insurancePolicyNumber || form.insurancePolicyNumber.trim().length === 0)) {
        errors.insurancePolicyNumber = "Insurance policy number is required";
    } else if (form.insurancePolicyNumber && form.insurancePolicyNumber.trim().length < 5) {
        errors.insurancePolicyNumber = "Insurance policy number must be at least 5 characters";
    }

    // Address validation (REQUIRED)
    if (isRequired && (!form.address || form.address.trim().length === 0)) {
        errors.address = "Address is required";
    } else if (form.address && form.address.trim().length < 5) {
        errors.address = "Address must be at least 5 characters";
    }

    return errors;
};
