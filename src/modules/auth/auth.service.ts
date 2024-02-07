import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ILogin } from '../../interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IRegistration } from '../../interfaces/auth.interface';
import { RedisService } from '../redis/redis.service';
import { IUser } from '../../interfaces/user.interface';
import { IPayload } from '../../interfaces/token.interface';

interface IAuthService {
    login: (dto: ILogin) => Promise<{ jwt: string }>;
    registration: (dto: IRegistration) => Promise<{ message: string }>;
    userInfo: (jwt: IPayload) => Promise<IUser>;
}

@Injectable()
export class AuthService implements IAuthService {
    logger: Logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) {}

    public async login(dto: ILogin) {
        let user: IUser;

        const userInRedis = await this.redisService.get(dto.username);

        if (userInRedis) {
            user = { username: dto.username, ...JSON.parse(userInRedis) };
        } else {
            user = await this.prisma.user.findUnique({
                where: { username: dto.username.trim().toLocaleLowerCase() },
            });

            if (!user) throw new BadRequestException('incorrect username or password');

            this.setUserInRedis(user);
        }

        const isMatch = await this.checkPassword(dto.password, user.password);
        if (!isMatch) throw new BadRequestException('incorrect username or password');

        const jwt = await this.generateToken({
            userId: user.id,
            username: user.username,
        });

        return { jwt };
    }

    public async registration(dto: IRegistration) {
        const userInRedis = await this.redisService.get(dto.username);
        if (userInRedis) throw new BadRequestException('user is exist');

        const userInDb = await this.prisma.user.findUnique({
            where: { username: dto.username.trim().toLocaleLowerCase() },
        });
        if (userInDb) throw new BadRequestException('user is exist');

        const passwordHash = await this.generatePasswordHash(dto.password);

        const newUser = await this.prisma.user.create({
            data: {
                username: dto.username.trim().toLocaleLowerCase(),
                password: passwordHash,
                fullName: dto.fullName,
            },
        });
        if (!newUser) throw new InternalServerErrorException('error add user');

        this.setUserInRedis(newUser);

        return { message: 'add user done' };
    }

    public async userInfo(jwt: IPayload) {
        const userInRedis = await this.redisService.get(jwt.username);
        if (userInRedis) {
            const userData: IUser = { username: jwt.username, ...JSON.parse(userInRedis) };
            return userData;
        }

        const userInDb = await this.prisma.user.findUnique({
            where: { username: jwt.username },
        });
        if (!userInDb) throw new NotFoundException('user is not found');

        this.setUserInRedis(userInDb);

        return userInDb;
    }

    private async generatePasswordHash(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, 12);
        } catch (err) {
            this.logger.error('generatePasswordHash:', err);
            throw new InternalServerErrorException();
        }
    }

    private async checkPassword(passwordInReq: string, passwordHash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(passwordInReq, passwordHash);
        } catch (err) {
            this.logger.error('checkPassword:', err);
            throw new InternalServerErrorException();
        }
    }

    private async generateToken(payload: IPayload): Promise<string> {
        try {
            return this.jwtService.signAsync(payload, {
                secret: process.env['JWT_SECRET'],
                expiresIn: 60 * 60 * 24 * 7,
            });
        } catch (err) {
            this.logger.error('generateToken', err);
            throw new InternalServerErrorException();
        }
    }

    private async setUserInRedis(user: IUser): Promise<void> {
        try {
            await this.redisService.set(
                user.username, //
                JSON.stringify({
                    userId: user.id,
                    fullName: user.fullName,
                    password: user.password,
                }),
                60 * 60,
            );
        } catch (err) {
            this.logger.error('setUserInRedis', err);
            throw new InternalServerErrorException();
        }
    }
}
