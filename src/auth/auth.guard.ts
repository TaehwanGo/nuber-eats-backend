import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  // CanActivate는 true를 return하면 request를 진행시키고 false면 request를 멈추게 함
  // canActivate()는 ExecutionContext를 사용, request의 context에 접근 할 수 있게 함
  // graphql의 context가 아닌 현재 pipeline의 context, 즉 request의 context
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    // console.log(role);
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext(); // http context를 graphql context로 변환
    const user: User = gqlContext.user;
    console.log(user);
    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }

    return roles.includes(user.role);
  }
}
