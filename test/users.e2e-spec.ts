import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // users e2e test 이지만 전체 app을 import해야 테스트가 가능
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // test 후 testDB를 삭제하기 위해 db와 연결 후 drop
    await getConnection().dropDatabase();
    app.close(); // for Jest did not exit one second after the test run has completed
  });
  // e2e test를 beforeAll에서 한번 db연결후 계속 이어서 하기 때문에 test 순서를 잘 고려해야 함
  // it.todo('createAccount');
  describe('createAccount', () => {
    const EMAIL = 'asdf@asdf.com';
    it('should create account', () => {
      // supertest를 이용해서 request를 보냄
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          creatAccount(input: {
            email: "${EMAIL}",
            password: "789456",
            role: Client
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          console.log(res.body);
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
  });
  it.todo('verifyEmail');
  it.todo('login');
  it.todo('me');
  it.todo('userProfile');
  it.todo('editProfile');
});
