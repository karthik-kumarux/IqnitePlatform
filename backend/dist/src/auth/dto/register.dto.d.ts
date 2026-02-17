export declare enum UserRole {
    ADMIN = "ADMIN",
    ORGANIZER = "ORGANIZER",
    PARTICIPANT = "PARTICIPANT"
}
export declare class RegisterDto {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
}
