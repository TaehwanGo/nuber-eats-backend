import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verifty-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    // console.log(this.config.get('SECRET_KEY'));
    // this.jwtService.hello();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
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
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          // code:123123,
          user,
        }),
      );
      // email verification
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      // return error instead of throw it, 대신 resolver에서 설정을 해줄 필요가 있음
      return { ok: false, error: `Couldn't create account : ${e}` };
    }

    // hash the password // somewhere
    // return ok or error
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // 1. find the user with the email
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      ); // password가 selct: false이므로 {select:["password"]}를 추가함
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      // 2. check if the password is correct
      const passwordCorrect = await user.checkPassword(password); // 근데 서버로 날것의 password가 그냥 전송되도 되나?
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // 3. make a JWT and give it to the user
      const token = this.jwtService.sign(user.id); // jwt.sign({ id: user.id }, this.config.get('SECRET_KEY')); // process.env.SECRET_KEY == this.config.get('SECRET_KEY')
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

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      // console.log('user:', user);
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        console.log('editProfile email:', user.email);
        console.log('verification.code:', verification.code);
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not update profile' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
        // { loadRelationIds: true }, // { relations: ['user']}, // related 된 user를 통째로 불러옴(verification entity안에 포함돼서)
      );
      if (verification) {
        // console.log(verification, verification.user); // verification.user : undefined // TypeOrm은 자동으로 relation을 해주지 않음 : 느려지기 때문
        verification.user.verified = true;
        await this.users.save(verification.user); // 만약 id만 가져온다면 this.users.update(verification.user.id, { verified: true });  이런식으로 업데이트 할 수 있을 것 같다.
        // @BeforeInsert로 인해서 password가 다시 hash되버리는 문제 발생
        // 1. password를 선택하지 않는 방법 : @Column({select:false}) - user.entity
        // 2. @BeforeInsert의 hashPassword()에서 password가 있을 경우에만 hash : if(this.password)
        await this.verifications.delete(verification.id); // 유저인증이 되면 삭제
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
