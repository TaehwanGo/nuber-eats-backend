import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config'; // ComfigModule을 global로 설정했기 때문에 providers에 등록하지 않고 사용할 수 있음
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // service에 필요한 repository를 등록(TypeOrmModule)
  providers: [UsersResolver, UsersService], // app.module에서 ConfigModule을 import하면 ConfigService를 사용할 수 있음
  exports: [UsersService],
})
export class UsersModule {}
