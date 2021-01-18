import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { response } from 'express';

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
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // users e2e test 이지만 전체 app을 import해야 테스트가 가능
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  const sendGraphqlQuery = (query: string) =>
    request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({ query });

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
          // console.log(res.body);
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
          // console.log(res.body);
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
          jwtToken = login.token;
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
          // console.log('jwtToken in login:', jwtToken);
        });
    });
  });
  // it.todo('userProfile');
  describe('userProfile', () => {
    // login만 되어 있다면 어떤 user의 profile을 볼 수 있음(id로 검색)
    // 유저가 찾아질 경우도 있지만 찾을 수 없는 경우도 있음(found, not found먼저 체크)
    // 어떻게 user id를 가져올까? test할때마다 DB를 drop하기 때문에 만든 id는 항상 1임
    // 그렇지만 그건 재밌는 방법이 아님 -> user의 Repository를 이용
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
      // console.log('user:', user);
      // console.log('jwtToken:', jwtToken);
    });
    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken) // superTest를 사용해서 header를 set하는 방법(POST다음에 set()을 사용해야함)
        .send({
          query: `{
          userProfile(userId:${userId}){
            ok
            error
            user{
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          // console.log('res.body:', res.body); // 왜 body의 data가 null 일까? jwt를 로그인 성공하는 곳이 아닌 실패하는 곳에서 받아오고 있었음
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken) // superTest를 사용해서 header를 set하는 방법(POST다음에 set()을 사용해야함)
        .send({
          query: `{
          userProfile(userId:123){
            ok
            error
            user{
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User Not Found');
          expect(user).toBe(null);
        });
    });
  });
  // it.todo('me');
  describe('me', () => {
    // 로그인이 됐다면 작동하고 아니면 작동안하는 두가지 경우를 테스트해야함
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken) // superTest를 사용해서 header를 set하는 방법(POST다음에 set()을 사용해야함)
        .send({
          query: `{
          me {
            id
            email
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
          me {
            id
            email
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  it.todo('verifyEmail');
  it.todo('editProfile');
});
