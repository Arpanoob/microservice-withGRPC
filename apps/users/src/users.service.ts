import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from './entities/user.entities';
import { CreateUserDto } from '@app/contracts/users/create-user.dto';
import { LoginUserDto } from '@app/contracts/users/login-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new this.userModel(createUserDto);
    await user.save();

    await this.cacheManager.del(`user_${user._id}`);

    return { message: 'User created successfully', userId: user._id };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    console.log("token :en")

    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
    console.log("token : ", token)
    return { token };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 }).exec();
  }


  async findOne(userId: string): Promise<User | null> {
    const cachedUser = await this.cacheManager.get<User | null>(`user_${userId}`);
    console.log(cachedUser, "chahahahah")
    if (cachedUser) {
      console.log('Returning cached user');
      return cachedUser;
    }

    const user = await this.userModel.findById(userId, { password: 0 }).lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set(`user_${userId}`, user, 30000);

    return user;
  }

  async update(userId: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    console.log(userId, updateUserDto, "Before update");

    if (updateUserDto.email) {
      throw new Error("Email update is not allowed");
    }

    // Fetch the user first
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const new_bboks = updateUserDto.OwnBooks || []

    user.OwnBooks.push(...new_bboks);

    // Save the updated document
    const updatedUser = await user.save();
    console.log(updatedUser, "After update");

    await this.cacheManager.set(`user_${userId}`, updatedUser, 60000);

    return updatedUser;
  }



  async delete(userId: string): Promise<{ message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.del(`user_${userId}`);

    return { message: 'User deleted successfully' };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.cacheManager.del(`user_${userId}`);
    return { message: 'User logged out successfully' };
  }
}
