import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions, // private readonly configService: ConfigService // 이것만 해도 app.module에서 forRoot로 PRIVATE_KEY를 넘겨줄 필요는 없었으나 연습을 위해 만들어 봄
  ) {
    console.log('options:', options); // this.options
  }
  sign(payload: object): string {
    return jwt.sign(payload, this.options.privateKey);
  }
}
