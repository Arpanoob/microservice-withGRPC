import { Controller, Get, InternalServerErrorException, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BooksService } from './books.service';
import { CreateBookDto } from '@app/contracts/books/create-book.dto';
import { UpdateBookDto } from '@app/contracts/books/update-book.dto';

@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Get("/ping")
  async ping() {
    try {
      const message = await this.booksService.pong();
      console.log(message)
      return { data: message };
    } catch (e) {
      throw new InternalServerErrorException('Failed to pong' + e);
    }
  }

  @Get("/p")
  async p() {
    try {
      return {
        message: "okk"
      };
    } catch (e) {
      throw new InternalServerErrorException('Failed to pong' + e);
    }

  }

  @Post('/create')
  @MessagePattern('books.createBook')
  async create(@Payload() createBookDto: CreateBookDto) {
    try {
      return { data: await this.booksService.create(createBookDto) };
    } catch (error) {
      console.error('Error creating book:', error);
      throw new InternalServerErrorException('Failed to create book');
    }
  }

  @MessagePattern('books.findAllBooks')
  async findAll() {
    try {
      return await this.booksService.findAll();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new InternalServerErrorException('Failed to fetch books');
    }
  }

  @MessagePattern('books.findOneBook')
  async findOne(@Payload() { id }: { id: string }) {
    try {
      return await this.booksService.findOne(id);
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      throw new InternalServerErrorException(`Failed to fetch book with ID ${id}`);
    }
  }

  @MessagePattern('books.updateBook')
  async update(@Payload() updateBookDto: UpdateBookDto) {
    try {
      return await this.booksService.update(updateBookDto.id, updateBookDto);
    } catch (error) {
      console.error(`Error updating book with ID ${updateBookDto.id}:`, error);
      throw new InternalServerErrorException(`Failed to update book with ID ${updateBookDto.id}`);
    }
  }

  @MessagePattern('books.removeBook')
  async remove(@Payload() { id }: { id: string }) {
    try {
      return await this.booksService.remove(id);
    } catch (error) {
      console.error(`Error deleting book with ID ${id}:`, error);
      throw new InternalServerErrorException(`Failed to delete book with ID ${id}`);
    }
  }
}
