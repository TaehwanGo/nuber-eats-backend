// import { Query } from '@nestjs/common'; // Query는 common에서 import하는게 아니라
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'; // graphql에서 import 해야 됨
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
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
      const { ok, error } = await this.usersService.createAccount(
        createAccountInput,
      );
      if (error) {
        // go 언어 방식의 silent error handling
        return {
          ok,
          error,
        };
      }
      return { ok };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
