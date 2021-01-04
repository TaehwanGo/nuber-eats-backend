import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
// import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true, // 메모리에 자동으로 만들어 져서 schema 파일을 따로 안만들어도 되게 하는 설정(code first & typescript라서 가능) // 아니면 이런식으로 파일이 만들어짐 autoSchemaFile: join(process.cwd(), 'src/schema.gql')
    }),
    RestaurantsModule, // resolver module
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
