import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { GetTokenPayload, Public } from '../../decorators';
import { IPayload } from '../../interfaces/token.interface';
import { IUser } from '../../interfaces/user.interface';

interface IAuthController {
    login: (dto: LoginDto) => Promise<{ jwt: string }>;
    registration: (dto: RegistrationDto) => Promise<{ message: string }>;
    userInfo: (jwt: IPayload) => Promise<IUser>;
}

@Controller('auth')
export class AuthController implements IAuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }

    @Public()
    @Post('registration')
    async registration(@Body() dto: RegistrationDto) {
        return await this.authService.registration(dto);
    }

    @Get('user-info')
    async userInfo(@GetTokenPayload() jwt: IPayload) {
        return await this.authService.userInfo(jwt);
    }
}
