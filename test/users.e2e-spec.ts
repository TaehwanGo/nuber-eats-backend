import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql';
// const EMAIL = 'asdf@asdf.com';
// const PASSWORD = '789456';
const testUser = {
  email: 'asdf@asdf.com',
  password: '789456',
};

jest.mock('got', () => {
  // email verification에서 사용되는 got의 post를 mock으로 대체함(메일을 보내지 않기 위해)
  return {
    post: jest.fn(),
  };
});

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

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
    it('should create account', () => {
      // supertest를 이용해서 request를 보냄
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
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

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
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
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String)); // toBe는 정확히 같아야 하기 때문에 toEqual을 사용
        });
    });
  });
  // it.todo('login'); // login 상태에서 userProfile을 볼 수 있게 해야 하기 때문에 login이 userProfile보다 먼저
  describe('login', () => {
    it('should login with correct credentials', () => {
      // jwt token을 받아오는 것
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          login(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          login(input: {
            email: "${testUser.email}",
            password: "xxx",
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password');
          expect(login.token).toBe(null);
          jwtToken = login.token;
        });
    });
  });
  it.todo('userProfile');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
