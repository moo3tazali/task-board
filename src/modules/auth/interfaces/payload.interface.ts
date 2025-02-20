import { Role } from '@prisma/client';

export interface Payload {
  sub: string;
  username: string;
  email: string;
  avatarPath: string;
  roles: Role[];
}
