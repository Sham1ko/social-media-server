import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Request,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MongoServerError } from 'mongodb';
import { AuthService } from './auth.service';
import { IAuth } from './interfaces';
import { LoginUserDto } from './dto/login-auth.dto';
import { RegisterUserDto } from './dto/register-auth.dto';
import { capitalizeFirstLetter } from 'src/helpers';
import { AuthGuard } from './auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registration user',
    description: 'Registration with provided credentials',
  })
  @ApiResponse({
    status: 201,
    description: 'User registration success',
    schema: {
      properties: {
        user: {
          properties: {
            _id: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async register(@Body() body: RegisterUserDto): Promise<IAuth> {
    try {
      return await this.authService.register(body);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue)[0];

        throw new HttpException(
          `User with the same ${duplicateField} already exists`,
          HttpStatus.CONFLICT,
        );
      } else {
        // For other types of errors, throw a generic forbidden error
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Login with provided credentials',
  })
  @ApiResponse({
    status: 201,
    description: 'Login success',
    schema: {
      properties: {
        user: {
          properties: {
            _id: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
        tokens: {
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async login(@Body() body: LoginUserDto): Promise<IAuth> {
    return await this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
