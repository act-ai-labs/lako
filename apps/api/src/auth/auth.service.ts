import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { User, UserRole } from '../database/entities';
import { JwtPayload } from './auth.types';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User, POSTGRES_CONNECTION)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultOwner();
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const user = await this.usersRepo.findOne({
      where: { username, isActive: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ??
          'dev-access-secret',
        expiresIn: this.getJwtTtl('JWT_ACCESS_TTL', '15m'),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'dev-refresh-secret',
        expiresIn: this.getJwtTtl('JWT_REFRESH_TTL', '7d'),
      }),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async verifyManagerPin(pin: string): Promise<{ authorized: true }> {
    const managers = await this.usersRepo.find({
      where: [
        { role: UserRole.OWNER, isActive: true },
        { role: UserRole.MANAGER, isActive: true },
      ],
    });

    for (const manager of managers) {
      if (
        manager.managerPinHash &&
        (await bcrypt.compare(pin, manager.managerPinHash))
      ) {
        return { authorized: true };
      }
    }

    throw new UnauthorizedException('Manager authorization failed');
  }

  private async seedDefaultOwner(): Promise<void> {
    const userCount = await this.usersRepo.count();
    if (userCount > 0) {
      return;
    }

    const password =
      this.configService.get<string>('DEFAULT_OWNER_PASSWORD') ?? 'lako-owner';
    const pin = this.configService.get<string>('DEFAULT_MANAGER_PIN') ?? '1234';

    const owner = this.usersRepo.create({
      username:
        this.configService.get<string>('DEFAULT_OWNER_USERNAME') ?? 'owner',
      passwordHash: await bcrypt.hash(password, 12),
      managerPinHash: await bcrypt.hash(pin, 12),
      role: UserRole.OWNER,
      isActive: true,
    });

    await this.usersRepo.save(owner);
  }

  private getJwtTtl(key: string, fallback: string): SignOptions['expiresIn'] {
    return (this.configService.get<string>(key) ??
      fallback) as SignOptions['expiresIn'];
  }
}
