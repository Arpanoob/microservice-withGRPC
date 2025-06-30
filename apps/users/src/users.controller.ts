import { Controller, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from '@app/contracts/users/create-user.dto';
import { LoginUserDto } from '@app/contracts/users/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService, private configService: ConfigService) { }

  @MessagePattern('user.create')
  async create(@Payload() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('user.login')
  async login(@Payload() loginUserDto: LoginUserDto) {
    try {
      console.log("hitted")
      return await this.usersService.login(loginUserDto);
    } catch (error) {
      console.log("login :", error)
      return this.handleException(error);
    }
  }

  @MessagePattern('user.findAll')
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('user.findOne')
  async findOne(@Payload() { userId }: { userId: string }) {
    try {
      console.log("user : ", userId)
      console.log("Config", this.configService.get<string>('REDIS_HOST'));
      return await this.usersService.findOne(userId);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @EventPattern('user.update')
  async update(@Payload() Payload: { userId: string; updateUserDto: Partial<CreateUserDto> }) {
    try {
      const { userId, updateUserDto } = Payload; 
      console.log("Updating user:", updateUserDto);
      return await this.usersService.update(userId, updateUserDto);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('user.delete')
  async delete(@Payload() { userId }: { userId: string }) {
    try {
      return await this.usersService.delete(userId);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('user.logout')
  async logout(@Payload() { userId }: { userId: string }) {
    try {
      return await this.usersService.logout(userId);
    } catch (error) {
      return this.handleException(error);
    }
  }

  private handleException(error: any) {
    console.error("Error:", error);

    if (error instanceof BadRequestException) {
      return { status: 400, message: error.message };
    } else if (error instanceof UnauthorizedException) {
      return { status: 401, message: error.message };
    } else if (error instanceof NotFoundException) {
      return { status: 404, message: error.message };
    } else {
      return { status: 500, message: 'Internal Server Error' };
    }
  }
}
