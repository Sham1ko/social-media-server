import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './dto/IUser';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
  ) {}

  /**
   * Create a new user in the database with hashed password.
   * @param body - CreateUserDto object containing user details, including password.
   * @returns A Promise that resolves to the newly created user.
   * @throws An error if the input is invalid or if an error occurs during user creation.
   */
  async create(body: CreateUserDto): Promise<PublicUser> {
    try {
      //Hashing password
      const saltRounds = parseInt(process.env.PASSWORD_ROUNDS);

      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(body.password, salt);

      const newUser: CreateUserDto = {
        ...body,
        password: hashedPassword,
      };
      const createdUser = await this.userRepository.create(newUser);

      const publicUser: PublicUser = {
        _id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
      };

      return publicUser;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  /**
   * Find all users in the database.
   * @returns A Promise that resolves to an array of all users in the database.
   * @throws An error if an error occurs during retrieval.
   */
  async findAll(): Promise<PublicUser[]> {
    const publicUsers: PublicUser[] = await this.userRepository
      .find()
      .select('_id username email');

    return publicUsers;
  }

  /**
   * Find a user by username.
   * @param username - The username of the user to find.
   * @returns A Promise that resolves to the user with the given username.
   */
  async findOne(username: string): Promise<PublicUser> {
    try {
      const user = await this.userRepository
        .findOne({ username })
        .select('_id username email');

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      return user;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  /**
   * Find a user by email.
   * @param email - The email of the user to find.
   * @returns A Promise that resolves to the user with the given email.
   */
  async findByEmail(email: string): Promise<PublicUser> {
    try {
      const user = await this.userRepository
        .findOne({ email })
        .select('_id username email');
      if (!user) {
        throw new NotFoundException('User does not exist');
      }
      return user;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  update(username: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${username} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  deleteAll() {
    return this.userRepository.deleteMany({}).exec();
  }
}
