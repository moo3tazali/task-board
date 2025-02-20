import { Role, User } from '@prisma/client';

export class UserProfile implements Omit<User, 'passwordHash'> {
  id: string;
  username: string;
  email: string;
  avatarPath: string | null;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}
