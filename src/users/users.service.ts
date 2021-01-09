import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService, // app.module에서 ConfigModule을 import하면 ConfigService를 사용할 수 있음
    private readonly jwtService: JwtService,
  ) {
    // console.log(this.config.get('SECRET_KEY'));
    // this.jwtService.hello();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // <string | undefined>
    // type을 or를 사용해서 여러개 return type을 지정할 수 있구나
    try {
      // check new user
      const exists = await this.users.findOne({ email });
      if (exists) {
        // return error instead of throw it, 대신 resolver에서 설정을 해줄 필요가 있음
        return { ok: false, error: 'There is a user with that email already' };
      }
      // create user & save it
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      // return error instead of throw it, 대신 resolver에서 설정을 해줄 필요가 있음
      return { ok: false, error: `Couldn't create account : ${e}` };
    }

    // hash the password // somewhere
    // return ok or error
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // 2. check if the password is correct
    // 3. make a JWT and give it to the user

    try {
      // 1. find the user with the email
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password); // 근데 서버로 날것의 password가 그냥 전송되도 되나?
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = jwt.sign({ id: user.id }, this.config.get('SECRET_KEY')); // process.env.SECRET_KEY == this.config.get('SECRET_KEY')
      // jwt.sign({ id: user.id }, this.config.get('SECRET_KEY'));를 this.jwt.sign()으로 바꾸기 위해 jwt 모듈 생성
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
