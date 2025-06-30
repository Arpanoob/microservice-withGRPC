import { CreateBookStockDto } from '@app/contracts/bookStore/create-bookstore.dto';
import { UpdateBookStockDto } from '@app/contracts/bookStore/update-bookstore.dto';
import { Controller, BadRequestException, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { EventPattern, GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { BookStockService } from './app.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class BookStockController {

    constructor(private readonly bookStockService: BookStockService) { }

    @GrpcMethod("BookStockService", "pong")
    pong() {
        console.log("Request aagyii !!!")
        return {
            pong: "pong"
        }
    }

 

    @MessagePattern("bookStock.proto")
    getProto(): { file: Buffer } {

        const filePath = path.join(__dirname, '..', 'proto', 'bookstock.proto');
        const file = fs.readFileSync(path.join(process.cwd(), 'apps/bookstore/src/proto/bookstock.proto')
        );
        return { file };
    }

    @GrpcMethod("BookStockService", "Create")
    async create(data: CreateBookStockDto) {
        try {
            console.log(`Creating book stock: ${JSON.stringify(data)}`);
            return await this.bookStockService.create(data);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "FindAll")
    async findAll() {
        try {
            return await this.bookStockService.findAll();
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "FindOne")
    async findOne(data: { id: string }) {
        try {
            return await this.bookStockService.findOne(data.id);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "FindStock")
    async findStock(data: { id: string }) {
        try {
            return await this.bookStockService.findStock(data.id);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "Update")
    async update(data: UpdateBookStockDto) {
        try {
            return await this.bookStockService.update(data);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "Remove")
    async remove(data: { id: string }) {
        try {
            return await this.bookStockService.remove(data.id);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "CheckStock")
    async checkStock(data: { book: string; quantity: number }) {
        try {
            console.log("inside bookStock : ", data.book, data.quantity);
            return await this.bookStockService.checkStock(data.book, data.quantity);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "DecreaseStock")
    async decreaseStock(data: { book: string; quantity: number }) {
        try {
            console.log("hitten", data.book, data.quantity);
            return await this.bookStockService.decreaseStock(data.book, data.quantity);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @GrpcMethod("BookStockService", "IncreaseStock")
    async increaseStock(data: { bookId: string; quantity: number }) {
        try {
            return await this.bookStockService.increaseStock(data.bookId, data.quantity);
        } catch (error) {
            return this.handleException(error);
        }
    }




    @EventPattern('bookStock.create')
    async create1(@Payload() createBookStockDto: CreateBookStockDto) {
        try {
            console.log(`Creating book stock: ${JSON.stringify(createBookStockDto)}`);
            return await this.bookStockService.create(createBookStockDto);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.findAll')
    async findAll1() {
        try {
            return await this.bookStockService.findAll();
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.findOne')
    async findOne1(@Payload() { id }: { id: string }) {
        try {
            return await this.bookStockService.findOne(id);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.findStock')
    async findStock1(@Payload() { id }: { id: string }) {
        try {
            return await this.bookStockService.findStock(id);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.update')
    async update11(@Payload() updateBookStockDto: UpdateBookStockDto) {
        try {
            return await this.bookStockService.update(updateBookStockDto);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.remove')
    async remove1(@Payload() { id }: { id: string }) {
        try {
            return await this.bookStockService.remove(id);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.checkStock')
    async checkStock1(@Payload() { book, quantity }: { book: string; quantity: number }) {
        try {
            console.log("inside bookStock : ", book, quantity)
            return await this.bookStockService.checkStock(book, quantity);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.decreaseStock')
    async decreaseStock1(@Payload() { book, quantity }: { book: string; quantity: number }) {
        try {
            console.log("hitten", book, quantity)
            return await this.bookStockService.decreaseStock(book, quantity);
        } catch (error) {
            return this.handleException(error);
        }
    }

    @MessagePattern('bookStock.increaseStock')
    async increaseStock1(@Payload() { bookId, quantity }: { bookId: string; quantity: number }) {
        try {
            return await this.bookStockService.increaseStock(bookId, quantity);
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



// import { CreateBookStockDto } from '@app/contracts/bookStore/create-bookstore.dto';
// import { UpdateBookStockDto } from '@app/contracts/bookStore/update-bookstore.dto';
// import { Controller, BadRequestException, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
// import { EventPattern, GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
// import { BookStockService } from './app.service';
// import * as path from 'path';
// import * as fs from 'fs';

// @Controller()
// export class BookStockController {

//     constructor(private readonly bookStockService: BookStockService) { }

//     @GrpcMethod("BookStockService", "pong")
//     pong() {
//         console.log("Request aagyii !!!")
//         return {
//             pong: "pong"
//         }
//     }

//     @MessagePattern("bookStock.proto")
//     getProto(): { file: Buffer } {

//         const filePath = path.join(__dirname, '..', 'proto', 'bookstock.proto');
//         const file = fs.readFileSync(path.join(process.cwd(), 'apps/bookstore/src/proto/bookstock.proto')
//         );
//         return { file };
//     }


//     @EventPattern('bookStock.create')
//     async create(@Payload() createBookStockDto: CreateBookStockDto) {
//         try {
//             console.log(`Creating book stock: ${JSON.stringify(createBookStockDto)}`);
//             return await this.bookStockService.create(createBookStockDto);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.findAll')
//     async findAll() {
//         try {
//             return await this.bookStockService.findAll();
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.findOne')
//     async findOne(@Payload() { id }: { id: string }) {
//         try {
//             return await this.bookStockService.findOne(id);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.findStock')
//     async findStock(@Payload() { id }: { id: string }) {
//         try {
//             return await this.bookStockService.findStock(id);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.update')
//     async update(@Payload() updateBookStockDto: UpdateBookStockDto) {
//         try {
//             return await this.bookStockService.update(updateBookStockDto);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.remove')
//     async remove(@Payload() { id }: { id: string }) {
//         try {
//             return await this.bookStockService.remove(id);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.checkStock')
//     async checkStock(@Payload() { book, quantity }: { book: string; quantity: number }) {
//         try {
//             console.log("inside bookStock : ", book, quantity)
//             return await this.bookStockService.checkStock(book, quantity);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.decreaseStock')
//     async decreaseStock(@Payload() { book, quantity }: { book: string; quantity: number }) {
//         try {
//             console.log("hitten", book, quantity)
//             return await this.bookStockService.decreaseStock(book, quantity);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     @MessagePattern('bookStock.increaseStock')
//     async increaseStock(@Payload() { bookId, quantity }: { bookId: string; quantity: number }) {
//         try {
//             return await this.bookStockService.increaseStock(bookId, quantity);
//         } catch (error) {
//             return this.handleException(error);
//         }
//     }

//     private handleException(error: any) {
//         console.error("Error:", error);

//         if (error instanceof BadRequestException) {
//             return { status: 400, message: error.message };
//         } else if (error instanceof UnauthorizedException) {
//             return { status: 401, message: error.message };
//         } else if (error instanceof NotFoundException) {
//             return { status: 404, message: error.message };
//         } else {
//             return { status: 500, message: 'Internal Server Error' };
//         }
//     }
// }

