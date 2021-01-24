import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  // CanActivate는 true를 return하면 request를 진행시키고 false면 request를 멈추게 함
  // canActivate()는 ExecutionContext를 사용, request의 context에 접근 할 수 있게 함
  // graphql의 context가 아닌 현재 pipeline의 context, 즉 request의 context
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    // console.log(role);
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext(); // http context를 graphql context로 변환
    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token); // token.toString()
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        // console.log(decoded['id']);
        const { user } = await this.usersService.findById(decoded['id']); // usersService를 사용하는 이유는 usersService에 Repository가 있기 때문
        //   console.log(user);
        if (!user) {
          return false;
        }
        gqlContext['user'] = user;
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role); // @Role(['Owner'])에서 ['Owner']가 현재 로그인된 user의 role을 포함하고 있는지 확인
      } else {
        // token에 문제가 있는 경우
        return false;
      }
    } else {
      return false;
    }
  }
}
