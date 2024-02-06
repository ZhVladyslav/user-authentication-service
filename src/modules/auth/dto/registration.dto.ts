import { IsNotEmpty, IsString } from 'class-validator';
import { IRegistration } from '../../../interfaces/auth.interface';

export class RegistrationDto implements IRegistration {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
