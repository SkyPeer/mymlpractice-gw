import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
  CanActivate,
} from '@nestjs/common';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { UserRole } from '@app/user/types/role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequestInterface>();

    // Meant to run after AuthGuard, which answers the 401 case. The optional
    // chaining only keeps an anonymous request from crashing on its own.
    if (request.user?.role !== UserRole.ADMIN) {
      throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
