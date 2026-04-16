import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // 检查邮箱唯一性
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // bcrypt 哈希密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 创建用户
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      username: dto.username,
    });
    await this.userRepository.save(user);

    // 签发 JWT
    const tokens = this.generateTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    // 查找用户
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // bcrypt 比对密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('该账号已被禁用');
    }

    // 更新 last_login_at
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 签发 JWT
    const tokens = this.generateTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('该账号已被禁用');
    }
    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const secret = this.configService.get<string>('jwt.refreshSecret');
      const payload = this.jwtService.verify(refreshToken, { secret });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }
      if (user.status !== 'active') {
        throw new UnauthorizedException('该账号已被禁用');
      }

      const tokens = this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('refresh_token 无效或已过期');
    }
  }

  async updateProfile(userId: string, data: { username?: string; avatar_url?: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (data.username !== undefined) {
      user.username = data.username;
    }
    if (data.avatar_url !== undefined) {
      user.avatarUrl = data.avatar_url;
    }

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('旧密码错误');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    return { message: '密码修改成功' };
  }

  generateTokens(user: User) {
    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');

    const payload = { sub: user.id, email: user.email, role: user.role };

    const access_token = this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '30d',
    });

    return { access_token, refresh_token };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
