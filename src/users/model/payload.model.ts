import { UserRole } from './user.model';

export interface Payload {
  sub: string;
  username: string;
  email: string;
  avatarPath: string;
  roles: UserRole[];
}
