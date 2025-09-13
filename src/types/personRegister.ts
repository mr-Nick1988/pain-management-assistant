export enum UserRole {
    NURSE = "NURSE",
    DOCTOR = "DOCTOR",
    ANESTHESIOLOGIST = "ANESTHESIOLOGIST",
    ADMIN = "ADMIN"
}

export interface PersonRegister {
    firstName: string;
    lastName: string;
    login: string;
    password: string;
    role: UserRole;
    id: string;
}

export interface PersonLogin {
    login: string;
    password: string;
}

export interface ChangeCredentialsType {
    oldPassword: string;
    newPassword: string;
    newLogin: string;
}

