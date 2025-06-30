import { IsString, IsNumber, IsOptional } from 'class-validator';

export class BookDto {

    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsString()
    author: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    description?: string;

}

