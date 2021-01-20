import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD, // 모든 곳에 적용
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
