import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    // console.log('auth.middleware', req.headers)
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];
    // console.log('AuthMiddleware: token', token);

    try {
      const decode: any = verify(token, JWT_SECRET);
      const user = await this.userService.findById(decode.id);
      req.user = user;
      console.log('AuthMiddleware: decode', decode);
    } catch (err) {
      req.user = null;
    } finally {
      next();
    }
  }
}
