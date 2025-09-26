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
    personId: string;
}

export interface PersonLogin {
    login: string;
    password: string;
}

export interface PersonLoginResponse {
    firstName: string;
    role: UserRole;
    temporaryCredentials: boolean;

}

export interface ChangeCredentialsType {
    currentLogin: string;
    oldPassword: string;
    newPassword: string;
    newLogin: string;
}

