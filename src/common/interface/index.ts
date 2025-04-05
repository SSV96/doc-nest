import { RolesEnum } from '../enum/roles.enum';
import { Request } from 'express';

export interface IUser {
  email: string;
  userId: string;
  role: RolesEnum;
}

export interface AuthenticatedRequest extends Request {
  user: IUser; // Attach authenticated user details
}
