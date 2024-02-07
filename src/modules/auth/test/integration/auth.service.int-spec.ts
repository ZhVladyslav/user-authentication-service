import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../../prisma/prisma.module';
import { RedisModule } from '../../../redis/redis.module';
import { AuthService } from '../../auth.service';
import { JwtStrategy } from '../../../../passport';
import { PrismaService } from '../../../prisma/prisma.service';

describe('AuthService Int', () => {
    let authService: AuthService;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [JwtModule.register({}), PrismaModule, RedisModule],
            providers: [AuthService, JwtStrategy],
        }).compile();

        authService = moduleRef.get(AuthService);
        prismaService = moduleRef.get(PrismaService);
    });

    let userName = Date.now().toString();

    describe('registration', () => {
        it('should create user', async () => {
            const newUser = await authService.registration({
                username: userName,
                fullName: 'Name',
                password: 'P@ssword1234',
            });

            expect(newUser.message).toBe('add user done');
        });

        it('should error user is exist', async () => {
            await expect(
                authService.registration({
                    username: userName,
                    fullName: 'Name',
                    password: 'P@ssword1234',
                }),
            ).rejects.toThrowError('user is exist');
        });
    });

    describe('login', () => {
        it('should login user', async () => {
            const jwt = await authService.login({
                username: userName,
                password: 'P@ssword1234',
            });

            expect(jwt.jwt).toEqual(expect.any(String));
        });

        it('should error incorrect username or password if incorrect username', async () => {
            await expect(
                authService.login({
                    username: 'user is not exist',
                    password: 'P@ssword1234',
                }),
            ).rejects.toThrowError('incorrect username or password');
        });

        it('should error incorrect username or password if incorrect password', async () => {
            await expect(
                authService.login({
                    username: userName,
                    password: '1111',
                }),
            ).rejects.toThrowError('incorrect username or password');
        });
    });

    describe('userInfo', () => {
        it('should user info', async () => {
            const userList = await prismaService.user.findMany();

            const userInfo = await authService.userInfo({
                userId: userList[0].id,
                username: userList[0].username,
            });

            expect(userInfo.username).toBe(userList[0].username);
            expect(userInfo.fullName).toBe('Name');
            expect(userInfo.password).toEqual(expect.any(String));
        });

        it('should error user is not found', async () => {
            await expect(
                authService.userInfo({
                    userId: 1,
                    username: 'user is not exist',
                }),
            ).rejects.toThrowError('user is not found');
        });
    });
});

