import { IUser } from './user.interface';

export interface ILogin extends Pick<IUser, 'username' | 'password'> {}

export interface IRegistration extends Omit<IUser, 'id'> {}
