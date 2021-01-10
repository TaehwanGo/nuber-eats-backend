import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  // CanActivate는 true를 return하면 request를 진행시키고 false면 request를 멈추게 함
  // canActivate()는 ExecutionContext를 사용, request의 context에 접근 할 수 있게 함
  // graphql의 context가 아닌 현재 pipeline의 context, 즉 request의 context
  canActivate(context: ExecutionContext) {
    // console.log('http context:', context);
    const gqlContext = GqlExecutionContext.create(context).getContext(); // http context를 graphql context로 변환
    // console.log('graphql context:', gqlContext);
    const user = gqlContext.user;
    console.log(user);
    if (!user) {
      return false;
    }
    return true; // false를 return하는 것은 request를 막음 - 어떻게? user.resolver에서 확인해보자
  }
}
