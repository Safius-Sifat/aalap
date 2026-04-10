import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        about: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async search(query: string, excludeId: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: excludeId } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 20,
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        name: true,
        phone: true,
        about: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
    });
  }
}
