import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoServerError } from 'mongodb';
import { capitalizeFirstLetter } from 'src/helpers';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue)[0];

        throw new HttpException(
          `${capitalizeFirstLetter(duplicateField)} already exists`,
          HttpStatus.CONFLICT,
        );
      } else {
        // For other types of errors, throw a generic forbidden error
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    }
  }

  @Get()
  findAll() {
    try {
      return this.userService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    try {
      return this.userService.findOne(username);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':username')
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(username, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Delete()
  deleteAll() {
    return this.userService.deleteAll();
  }
}
