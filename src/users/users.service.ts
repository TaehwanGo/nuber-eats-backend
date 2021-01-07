import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

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
}
