import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global() // global module로 만들면 사용할 모듈(users.module)에서 providers에 추가 안해도 됨
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    // 어떻게 options를 JwtService로 보낼까?
    // DynamicModule은 다른 module을 return하는 module임
    return {
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService], // 우리의 목적은 JwtModule만 import하면 JwtService도 사용 가능하게 하는 것(users.module에서)
    };
  }
}
