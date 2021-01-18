import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // users e2e test 이지만 전체 app을 import해야 테스트가 가능
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it.todo('creatAccount');
  it.todo('login');
  it.todo('me');
  it.todo('userProfile');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
