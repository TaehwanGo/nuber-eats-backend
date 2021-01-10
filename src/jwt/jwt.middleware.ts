import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  // users Repository를 가져올 것이기 때문에 다시 class로 middleware를 만듦
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService, // UsersService를 가지고 있는것은 UsersModel이므로 UsersModel에서 export를 해줘야 함
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // console.log(req.headers);
    if ('x-jwt' in req.headers) {
      //   console.log(req.headers['x-jwt']);
      // client로 부터 받은 token을 verify
      const token = req.headers['x-jwt'];
      const decoded = this.jwtService.verify(token); // token.toString()
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        // console.log(decoded['id']);
        try {
          const user = await this.usersService.findById(decoded['id']); // usersService를 사용하는 이유는 usersService에 Repository가 있기 때문
          //   console.log(user);
          req['user'] = user; // 이것을 graphql resolver로 보내야 됨 // graphql모듈은 apollo server에서 모든 것을 가져와서 사용가능(import { ApolloServerBase } from 'apollo-server-core';)
        } catch (e) {}
      }
    }
    next();
  }
}

// export function jwtMiddleware(req: Request, res: Response, next: NextFunction) { // function, find the user that has the token
//   console.log(req.headers);
//   next();
// }
