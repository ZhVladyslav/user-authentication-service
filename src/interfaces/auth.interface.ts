export interface ILogin {
    username: string;
    password: string;
}

export interface IRegistration {
    fullName: string;
    username: string;
    password: string;
}

export interface IPayload {
    userId: number;
    username: string;
    fullName: string;
}
