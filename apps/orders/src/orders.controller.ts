import { Controller, BadRequestException, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from '@app/contracts/orders/create-order.dto';
import { UpdateOrderDto } from '@app/contracts/orders/update-order.dto';

@Controller()
export class OrdersController {

  constructor(private readonly ordersService: OrdersService) { }

  @MessagePattern('orders.create')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    try {
      console.log(`Creating order: ${JSON.stringify(createOrderDto)}`);
      return await this.ordersService.create(createOrderDto);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('orders.findAll')
  async findAll() {
    try {
      return await this.ordersService.findAll();
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('orders.findOne')
  async findOne(@Payload() { id }: { id: string }) {
    try {
      return await this.ordersService.findOne(id);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('orders.update')
  async update(@Payload() updateOrderDto: UpdateOrderDto) {
    try {
      return await this.ordersService.update(updateOrderDto.id, updateOrderDto);
    } catch (error) {
      return this.handleException(error);
    }
  }

  @MessagePattern('orders.remove')
  async remove(@Payload() { id }: { id: string }) {
    try {
      return await this.ordersService.remove(id);
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
