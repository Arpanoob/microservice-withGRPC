import { IsMongoId, IsNotEmpty } from "class-validator";

export class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  book: string;

  @IsNotEmpty()
  quantity: number;
}
