import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi'; // typescript에서 javascript 패키지를 import하는 방법
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
// import { Restaurant } from './restaurants/entities/restaurant.entitiy';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // app의 어디에서든 config module에 접근 가능한지 여부
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // 서버에 deploy할때 .env파일(environment variable파일)을 사용하지 않겠다는 것
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(), // Joi.object의 key를 .env파일로 지정하고 validation조건을 입력하면 .env와 비교해서 결과를 알려주는 것 같다.
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      // TypeORM으로 DB와 연결
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', // TypeORM이 데이터베이스에 연결할 때 DB를 나의 모듈의 현재 상태로 마이그레이션 한다는 뜻
      logging: process.env.NODE_ENV !== 'prod',
      entities: [User, Verification], // **1. entities: [Restaurant] 이것 덕분에 Restaurant가 DB가 되는 것
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true, // 메모리에 자동으로 만들어 져서 schema 파일을 따로 안만들어도 되게 하는 설정(code first & typescript라서 가능) // 아니면 이런식으로 파일이 만들어짐 autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      context: ({ req }) => {
        console.log('GraphQLModule context start'); // query가 resolver에 들어오기 전까지 context는 실행이 안되기 때문에 middleware에서 생성한 user를 받을 수 있음
        return { user: req['user'] };
      }, // req:Request (JwtMiddleware)
    }),
    // RestaurantsModule,
    UsersModule,
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  // app.use() requires a middleware function // 다시 app.module에서 아래와 같은 방식으로 middleware를 추가함
  configure(consumer: MiddlewareConsumer) {
    // main.ts에 app.use(jwtMiddleware); 를 추가 하는 것으로 대체 됨 : app전체에 적용
    // app 전체에 적용할 middleware 설정
    consumer
      .apply(JwtMiddleware) //
      .forRoutes({
        // JwtMiddleware(class)에서 function으로 바꿈
        path: '/graphql', // 특정 경로에 적용 <-> main.ts에 app.use를 사용하는 방식과 달리 특정경로에
        method: RequestMethod.POST,
      });
  }
}
