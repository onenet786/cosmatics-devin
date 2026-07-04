import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roleId: user.roleId,
    };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        tenantId: user.tenantId,
      },
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.users.findById(userId);
    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid current password');
    const hash = await bcrypt.hash(newPassword, 10);
    return this.users.updatePassword(userId, hash);
  }
}
