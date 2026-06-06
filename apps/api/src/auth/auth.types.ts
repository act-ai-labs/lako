import { Request } from 'express';
import { UserRole } from '../database/entities';

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
