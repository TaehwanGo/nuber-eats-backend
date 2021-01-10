// import { Query } from '@nestjs/common'; // Query는 common에서 import하는게 아니라
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql'; // graphql에서 import 해야 됨
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
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
  @UseGuards(AuthGuard) // 오.. ! 이렇게 가드를 추가해서 조건에 따라 진행되는 것을 막을 수 있구나
  me(@AuthUser() authUser: User) {
    // console.log(authUser);
    return authUser;
  }
}
