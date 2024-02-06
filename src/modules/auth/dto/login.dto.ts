import { IsNotEmpty, IsString } from 'class-validator';
import { ILogin } from '../../../interfaces/auth.interface';

export class LoginDto implements ILogin {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
