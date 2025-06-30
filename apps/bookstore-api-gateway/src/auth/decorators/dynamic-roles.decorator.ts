import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export interface RoleMetadata {
  role: string[];
  endpoint: string;
  method:string
}

export const Roles = (...roleData: RoleMetadata[]) => SetMetadata(ROLES_KEY, roleData);
