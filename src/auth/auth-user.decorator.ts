import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // factory function, it has unknown value, data, context
    const gqlContext = GqlExecutionContext.create(ctx).getContext(); // http context를 graphql context로 변환
    const user = gqlContext['user'];
    return user;
  },
);
