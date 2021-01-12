import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './mail.service';

@Global()
@Module({})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    // 어떻게 options를 JwtService로 보낼까?
    // DynamicModule은 다른 module을 return하는 module임
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        MailService,
      ],
      exports: [MailService], // 우리의 목적은 JwtModule만 import하면 JwtService도 사용 가능하게 하는 것(users.module에서)
    };
  }
}
