interface PersonForm {
    personId?: string;
    login?: string;
    password?: string;
    role?: string;
}

export const validatePerson = (form: PersonForm): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Person ID validation (passport-like, alphanumeric)
    if (form.personId) {
        if (form.personId.trim().length < 6) {
            errors.personId = "Person ID must be at least 6 characters";
        }
        if (form.personId.trim().length > 20) {
            errors.personId = "Person ID must not exceed 20 characters";
        }
        if (!/^[a-zA-Z0-9]+$/.test(form.personId.trim())) {
            errors.personId = "Person ID must contain only letters and numbers (no spaces or special characters)";
        }
    }

    // Login validation
    if (form.login) {
        if (form.login.trim().length < 3) {
            errors.login = "Login must be at least 3 characters";
        }
        if (form.login.trim().length > 30) {
            errors.login = "Login must not exceed 30 characters";
        }
        if (!/^[a-zA-Z0-9_]+$/.test(form.login.trim())) {
            errors.login = "Login can only contain letters, numbers, and underscores";
        }
    }

    // Password validation
    if (form.password) {
        if (form.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        if (form.password.length > 50) {
            errors.password = "Password must not exceed 50 characters";
        }
        // Optional: require at least one number and one letter
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
            errors.password = "Password must contain at least one letter and one number";
        }
    }

    // Role validation
    if (form.role && !["DOCTOR", "NURSE", "ANESTHESIOLOGIST"].includes(form.role)) {
        errors.role = "Invalid role selected";
    }

    return errors;
};
