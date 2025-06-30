import { IsArray, IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';


export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orders: OrderItemDto[];
}
