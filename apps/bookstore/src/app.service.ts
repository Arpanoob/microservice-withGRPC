import { CreateBookStockDto } from '@app/contracts/bookStore/create-bookstore.dto';
import { UpdateBookStockDto } from '@app/contracts/bookStore/update-bookstore.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookStock } from './entities/bookstore.entities';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class BookStockService {
    constructor(@InjectModel(BookStock.name) private bookStockModel: Model<BookStock>) { }
    
    async create(createBookStockDto: CreateBookStockDto) {
        const newBookStock = new this.bookStockModel(createBookStockDto);

        return await newBookStock.save();
    }

    async findAll() {
        return await this.bookStockModel.find()
    }

    async findOne(id: string) {
        const bookStock = await this.bookStockModel.findById(id)
        if (!bookStock) throw new NotFoundException(`BookStock with ID ${id} not found`);
        return bookStock;
    }
    
    async findStock(id: string) {
        const bookStock = await this.bookStockModel.findOne({ book:id })
        if (!bookStock) throw new NotFoundException(`Book with ID ${id} not found in bookstock`);
        return bookStock;
    }
    async update(updateBookStockDto: UpdateBookStockDto) {
        const updatedBookStock = await this.bookStockModel.findByIdAndUpdate(
            updateBookStockDto.id,
            { stock: updateBookStockDto.stock },
            { new: true }
        );

        if (!updatedBookStock) throw new NotFoundException(`BookStock with ID ${updateBookStockDto.id} not found`);
        return updatedBookStock;
    }

    async remove(id: string) {
        const deletedBookStock = await this.bookStockModel.findByIdAndDelete(id);
        if (!deletedBookStock) throw new NotFoundException(`BookStock with ID ${id} not found`);
        return { message: `BookStock with ID ${id} deleted`, deletedBookStock };
    }

    async checkStock(bookId: string, quantity: number) {
        const bookStock = await this.bookStockModel.findOne({ book: bookId });

        if (!bookStock) {
            return { available: false, message: `Book with ID ${bookId} not found in stock` };
        }

        if (bookStock.stock < quantity) {
            return { available: false, message: `Insufficient stock for book ${bookId}` };
        }

        return { available: true, message: `Stock available for book ${bookId}` };
    }

    async decreaseStock(bookId: string, quantity: number) {
        const bookStock = await this.bookStockModel.findOne({ book: bookId });

        if (!bookStock) {
            return { success: false, message: `Book with ID ${bookId} not found in stock` };
        }

        if (bookStock.stock < quantity) {
            return { success: false, message: `Insufficient stock for book ${bookId}` };
        }

        bookStock.stock -= quantity;
        await bookStock.save();

        return { success: true, message: `Stock reduced for book ${bookId}` };
    }


    async increaseStock(bookId: string, quantity: number) {
        console.log("insideeee,", bookId, quantity)
        const bookStock = await this.bookStockModel.findOne({book:bookId});
        if (!bookStock) throw new NotFoundException(`Book with ID ${bookId} not found`);

        bookStock.stock += +quantity;
        const a = await bookStock.save();
        return { message: `Stock increased by ${quantity} for book ID ${bookId}` };

    }

}
