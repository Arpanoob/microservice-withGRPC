import { IsMongoId, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class UpdateOrderDto {
    @IsMongoId()
    @IsNotEmpty()
    id: string;

    @IsMongoId()
    @IsOptional()
    userId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    @IsOptional()
    orders?: OrderItemDto[];
}
