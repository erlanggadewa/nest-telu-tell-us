import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async findOne(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }
}
