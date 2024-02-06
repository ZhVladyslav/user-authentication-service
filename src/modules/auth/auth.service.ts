import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ILogin } from '../../interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IPayload, IRegistration } from '../../interfaces/auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    public async login(dto: ILogin): Promise<{ jwt: string }> {
        const userInDb = await this.prisma.user.findUnique({
            where: {
                username: dto.username.trim().toLocaleLowerCase(),
            },
        });
        if (!userInDb) throw new BadRequestException('incorrect email or password');

        const isMatch = await this.checkPassword(dto.password, userInDb.password);
        if (!isMatch) throw new BadRequestException('incorrect email or password');

        const tokenPayload: IPayload = {
            userId: userInDb.id,
            username: userInDb.username,
            fullName: userInDb.fullName,
        };

        const jwt = await this.generateToken(tokenPayload);

        return { jwt };
    }

    public async registration(dto: IRegistration) {
        const userInDb = await this.prisma.user.findUnique({
            where: {
                username: dto.username.trim().toLocaleLowerCase(),
            },
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

        return { message: 'add user done' };
    }

    public async userInfo(jwt: IPayload) {
        const userInDb = await this.prisma.user.findUnique({
            where: {
                id: jwt.userId,
            },
            select: {
                id: true,
                username: true,
                fullName: true,
            },
        });
        if (!userInDb) throw new NotFoundException('user is not found');

        return userInDb;
    }

    private async generatePasswordHash(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, 12);
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    private async checkPassword(passwordInReq: string, passwordHash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(passwordInReq, passwordHash);
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    private async generateToken(payload: IPayload) {
        try {
            return this.jwtService.signAsync(payload, {
                secret: process.env['JWT_SECRET'],
                expiresIn: 60 * 60 * 24 * 7,
            });
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }
}
