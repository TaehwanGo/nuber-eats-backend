import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigService], // service에 필요한 repository를 등록(TypeOrmModule)
  providers: [UsersResolver, UsersService], // app.module에서 ConfigModule을 import하면 ConfigService를 사용할 수 있음
})
export class UsersModule {}
