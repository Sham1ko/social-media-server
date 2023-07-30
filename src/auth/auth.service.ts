import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PublicUser } from 'src/user/dto/IUser';
import { UserService } from 'src/user/user.service';
import { IAuth } from './interfaces';
import { LoginUserDto } from './dto/login-auth.dto';
import { RegisterUserDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(body: RegisterUserDto): Promise<IAuth> {
    try {
      const user = await this.userService.create(body);
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return { user, tokens: { accessToken, refreshToken } };
    } catch (error) {
      throw error;
    }
  }

  private generateAccessToken(user: PublicUser): string {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: PublicUser): string {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async login(body: LoginUserDto): Promise<IAuth> {
    try {
      const user = await this.userService.findByEmail(body.email);

      if (!user) throw new Error('User not found');
      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password,
      );
      if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
