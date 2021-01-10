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
  sign(userId: number): string {
    // sign(payload: object) 과 같이 object로 받아서 사용하면 여러 다른 모듈에서도 사용가능하지만 우린 여기서만 사용하게 만듦
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
  verify(token: string) {
    // token은 middleware에서 받고 왜 verify는 service에서 하지? jwt관련 기능(함수)을 service로 분리 후 다른곳(middleware)에서 dependency injection해서 사용
    return jwt.verify(token, this.options.privateKey);
  }
}
