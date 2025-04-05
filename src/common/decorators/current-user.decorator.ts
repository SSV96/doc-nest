import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, IUser } from '../interface';

const callBack = (data: keyof IUser, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

  const user = request.user;

  return data ? user[data] : user;
};

export const CurrentUser = createParamDecorator(callBack);
