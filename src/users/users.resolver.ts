// import { Query } from '@nestjs/common'; // Query는 common에서 import하는게 아니라
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql'; // graphql에서 import 해야 됨
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User) // 여기에 function() : (of) => User은 왜 arg로 넣는거지? // of => User
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean)
  hi() {
    return true;
  }

  @Mutation((returns) => CreateAccountOutput) // createAccountOutput : create-account.dto
  async creatAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      return this.usersService.createAccount(createAccountInput);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
      };
    }
  }

  @Query((returns) => User)
  me(@Context() context) {
    // 지금 로그인 되어 있는 user가 누구인지 반환하는 함수
    // 요청이 들어올때 REQUEST HEADERS에 있는 token을 받음 : jwt.middleware를 만들어서 토큰을 다룸 // main.ts에 추가 됨(app전체에 적용)
    // HTTP headers를 활용하는 방법을 사용
    // console.log(context);
    if (!context.user) {
      return;
    } else {
      return context.user;
    }
  }
}
