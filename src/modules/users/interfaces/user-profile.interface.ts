import { UserRole, User } from '@prisma/client';

export class UserProfile
  implements Omit<User, 'passwordHash' | 'createdAt' | 'updatedAt'>
{
  id: string;
  username: string;
  email: string;
  avatarPath: string | null;
  /**
   * List of user roles
   * @example ['ADMIN', 'USER']
   */
  roles: UserRole[];
}
