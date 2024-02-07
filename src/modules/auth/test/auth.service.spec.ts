import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { IUser } from '../../../interfaces/user.interface';
import { AuthController } from '../auth.controller';
import { RedisModule } from '../../redis/redis.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtStrategy } from '../../../passport';
import { JwtModule } from '@nestjs/jwt';
import { IRegistration } from '../../../interfaces/auth.interface';
import { IPayload } from '../../../interfaces/token.interface';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, JwtStrategy],
            imports: [JwtModule.register({}), PrismaModule, RedisModule],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return a JWT token', async () => {
            const mockDto = { username: 'testuser', password: 'testpassword' };
            const mockToken = 'mock-token';

            jest.spyOn(service, 'login').mockResolvedValueOnce({ jwt: mockToken });

            const result = await controller.login(mockDto);
            expect(result).toEqual({ jwt: mockToken });
        });
    });

    describe('registration', () => {
        it('should return a success message', async () => {
            const mockDto: IRegistration = { fullName: 'fullName', username: 'testuser', password: 'testpassword' };
            const mockMessage = 'Registration successful';

            jest.spyOn(service, 'registration').mockResolvedValueOnce({ message: mockMessage });

            const result = await controller.registration(mockDto);

            expect(result).toEqual({ message: mockMessage });
        });
    });

    describe('userInfo', () => {
        it('should return user information', async () => {
            const mockJwt: IPayload = { userId: 12, username: 'username' };
            const mockUserInfo: IUser = {
                id: 12,
                username: 'username',
                fullName: 'fullName',
                password: 'password',
            };

            jest.spyOn(service, 'userInfo').mockResolvedValueOnce(mockUserInfo);

            const result = await controller.userInfo(mockJwt);

            expect(result).toEqual(mockUserInfo);
        });
    });
});
