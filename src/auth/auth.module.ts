import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD, // 모든 곳에 적용
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
