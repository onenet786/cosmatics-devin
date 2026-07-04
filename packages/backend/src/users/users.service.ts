import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      include: { role: true, branches: { include: { branch: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true, branches: { include: { branch: true } } },
    });
  }

  updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getPermissions(roleId: string) {
    const perms = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return perms.map((p: any) => `${p.permission.module}:${p.permission.action}`);
  }
}
