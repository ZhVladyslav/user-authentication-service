import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { jwtStub, passwordHashStub } from './stubs';
import { IPayload } from '../../../interfaces/token.interface';
import { ILogin, IRegistration } from '../../../interfaces/auth.interface';
import { JwtStrategy } from '../../../passport';
import { BadRequestException } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController', () => {
    let controller: AuthController;

    const mockAuthService = {
        login: jest.fn().mockImplementation(() => jwtStub()),
        registration: jest.fn().mockImplementation(() => ({ message: 'add user done' })),
        userInfo: jest.fn().mockImplementation((jwt: IPayload) => ({
            id: Date.now(),
            fullName: 'Full Name',
            username: jwt.username,
            password: passwordHashStub(),
        })),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                JwtModule.register({}),
                PrismaModule,
                RedisModule
            ],
            controllers: [AuthController],
            providers: [
                AuthService,JwtStrategy
            ],
        })
            .overrideProvider(AuthService)
            .useValue(mockAuthService)
            .compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be different', () => {
        expect(controller).toBeDefined();
    });

    describe('registration', () => {
        it('should registration a user', async () => {
            const dto: IRegistration = {
                fullName: 'Full Name',
                username: 'Username',
                password: 'P@ssword1234',
            };

            expect(await controller.registration(dto)).toEqual({
                message: 'add user done',
            });

            expect(mockAuthService.registration).toHaveBeenCalledWith(dto);
        });

        it('should throw BadRequestException if user already exists', async () => {
            const existingUserDto: IRegistration = {
                fullName: 'Existing User',
                username: 'ExistingUsername',
                password: 'ExistingPassword',
            };

            mockAuthService.registration.mockRejectedValueOnce(new BadRequestException('user is exist'));

            await expect(controller.registration(existingUserDto)).rejects.toThrowError(BadRequestException);
            expect(mockAuthService.registration).toHaveBeenCalledWith(existingUserDto);
        });
    });

    describe('login', () => {
        it('should login a user', async () => {
            const dto: ILogin = {
                username: 'Username',
                password: 'P@ssword1234',
            };

            expect(await controller.login(dto)).toEqual({ jwt: expect.any(String) });

            expect(mockAuthService.login).toHaveBeenCalledWith(dto);
        });

        it('should throw BadRequestException if user does not exist', async () => {
            const nonExistentUserDto: ILogin = {
                username: 'NonExistentUsername',
                password: 'NonExistentPassword',
            };

            mockAuthService.login.mockRejectedValueOnce(new BadRequestException('incorrect username or password'));

            await expect(controller.login(nonExistentUserDto)).rejects.toThrowError(BadRequestException);
            expect(mockAuthService.login).toHaveBeenCalledWith(nonExistentUserDto);
        });

        it('should throw BadRequestException if password is incorrect', async () => {
            const existingUserDto: ILogin = {
                username: 'Username',
                password: 'IncorrectPassword',
            };

            mockAuthService.login.mockRejectedValueOnce(new BadRequestException('incorrect username or password'));

            await expect(controller.login(existingUserDto)).rejects.toThrowError(BadRequestException);
            expect(mockAuthService.login).toHaveBeenCalledWith(existingUserDto);
        });
    });

    describe('userInfo', () => {
        it('should info about user', async () => {
            const jwt: IPayload = {
                userId: Date.now(),
                username: 'Username',
            };

            expect(await controller.userInfo(jwt)).toEqual({
                id: expect.any(Number),
                username: jwt.username,
                fullName: expect.any(String),
                password: expect.any(String),
            });

            expect(mockAuthService.userInfo).toHaveBeenCalledWith(jwt);
        });

        it('should throw an error with invalid JWT', async () => {
            const invalidJwt: IPayload = {
                userId: Date.now(),
                username: 'Username',
            };

            mockAuthService.userInfo = jest.fn().mockRejectedValue(new Error('Invalid JWT'));

            await expect(controller.userInfo(invalidJwt)).rejects.toThrowError('Invalid JWT');
            expect(mockAuthService.userInfo).toHaveBeenCalledWith(invalidJwt);
        });
    });
});
