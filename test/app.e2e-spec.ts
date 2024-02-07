import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app/app.module';

describe('App (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    let userJwt: string;

    describe('AuthController', () => {
        describe('registration', () => {
            it('/auth/registration (POST)', () => {
                return request(app.getHttpServer())
                    .post('/auth/registration')
                    .send({
                        username: 'testuser',
                        password: 'testpassword',
                        fullName: 'Test User',
                    })
                    .expect(201)
                    .expect({ message: 'add user done' });
            });

            it('/auth/registration (POST) 400 user is exist', () => {
                return request(app.getHttpServer())
                    .post('/auth/registration')
                    .send({
                        username: 'testuser',
                        password: 'testpassword',
                        fullName: 'Test User',
                    })
                    .expect(400)
                    .expect((res) => {
                        const errorMessage = res.body.message;
                        expect(errorMessage).toContain('user is exist');
                    });
            });
        });

        describe('login', () => {
            it('/auth/login (POST)', () => {
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        username: 'testuser',
                        password: 'testpassword',
                    })
                    .expect(201)
                    .expect((res) => {
                        userJwt = res.body.jwt;
                    });
            });

            it('/auth/login (POST) invalid username', () => {
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        username: 'testusernotexist',
                        password: 'testpassword',
                    })
                    .expect(400)
                    .expect((res) => {
                        const errorMessage = res.body.message;
                        expect(errorMessage).toContain('incorrect username or password');
                    });
            });

            it('/auth/login (POST) invalid password', () => {
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        username: 'testuser',
                        password: '1111',
                    })
                    .expect(400)
                    .expect((res) => {
                        const errorMessage = res.body.message;
                        expect(errorMessage).toContain('incorrect username or password');
                    });
            });
        });

        describe('userInfo', () => {
            it('/auth/user-info (GET)', () => {
                return request(app.getHttpServer())
                    .get('/auth/user-info')
                    .set('Authorization', `Bearer ${userJwt}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body).toEqual(
                            expect.objectContaining({
                                userId: expect.any(Number),
                                username: 'testuser',
                                password: expect.any(String),
                                fullName: 'Test User',
                            }),
                        );
                    });
            });

            it('/auth/user-info (GET) no have jwt', () => {
                return request(app.getHttpServer()).get('/auth/user-info').expect(401);
            });
        });
    });
});
