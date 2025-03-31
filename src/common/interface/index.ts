import { RolesEnum } from '../enum/roles.enum';
import { Request } from 'express';

export interface IMe {
  email: string;
  userId: string;
  role: RolesEnum;
}

export interface AuthenticatedRequest extends Request {
  me: IMe; // Attach authenticated user details
}
