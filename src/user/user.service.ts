import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './schema/user.schema';
import { Query } from 'express-serve-static-core';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) {
      throw new BadRequestException('Please enter correct id.');
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async findAll(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          username: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const users = await this.userModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
    return users;
  }
}