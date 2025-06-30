import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './entities/book.entity';
import { CreateBookDto } from '@app/contracts/books/create-book.dto';
import { UpdateBookDto } from '@app/contracts/books/update-book.dto';
import { ClientGrpc, ClientKafka, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_DEST = path.join(process.cwd(), 'apps/books/src/proto/bookstock.proto')

// interface BookStockServiceGrpc {
//   pong({ }): Observable<string>;
// }
interface ICreateBookReqProto {
  book: string;
  stock: number;
}

interface ICreateBookResProto {
  id: string;
  book: string;
  stock: number;
}

type IMethod = "Create" | "FindAll"

@Injectable()
export class BooksService implements OnModuleInit {

  private grpcClient: any
  bookstockService: any;

  constructor(@InjectModel(Book.name) private bookModel: Model<Book>,
    @Inject('BOOKSTORE_CLIENT') private readonly bookstoreClient: ClientProxy,
    // @Inject('BOOKSTOCK_SERVICE') private readonly client: ClientGrpc,

    // @Inject('BOOKSTORE_KAFKA_CLIENT') private kafkaClient: ClientKafka
  ) { }
  async onModuleInit() {
    try {
      // await this.kafkaClient.connect();
      const res = await firstValueFrom(this.bookstoreClient.send("bookStock.proto", {}))
      const buffer = Buffer.from(res.file.data); // reconstruct the buffer
      const protoText = buffer.toString('utf-8');
      console.log("text : ", protoText)
      fs.mkdirSync(path.dirname(PROTO_DEST), { recursive: true });
      fs.writeFileSync(PROTO_DEST, protoText);
      const packageDefinition = protoLoader.loadSync(PROTO_DEST, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const proto = grpc.loadPackageDefinition(packageDefinition) as any;
      console.log(Object.keys(proto)); // should show ['bookstock']
      const bookstockPackage = proto.bookstock;
      // console.log(bookstockPackage); // should have 'BookStockService'

      this.grpcClient = new bookstockPackage.BookStockService(
        'localhost:50051',
        grpc.credentials.createInsecure()
      );
    // Object.pr(this.grpcClient)
    }
    catch (e) {
      console.error("Error is this : ", e)
    }
  }
  // onModuleInit() {
  //   this.bookstockService = this.client.getService<any>('BookStockService');
  // }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    console.log("loooooooo", createBookDto)
    const book = new this.bookModel(createBookDto);
    // this.kafkaClient.emit('bookStock.create', { book: book._id, stock: 0 });

    const bookStock = await this.grpcMethod<ICreateBookReqProto, ICreateBookResProto, IMethod>('Create', { book: book._id as string, stock: 0 })
    await book.save();
    console.log("= = =",book, bookStock)
    return book;
  }

  // async pong() {
  //   console.log("================>", this.grpcClient.pong())
  //   const response = await new Promise<any>((resolve, reject) => {
  //     this.grpcClient.pong({}, (err, res) => {
  //       if (err) return reject(err);
  //       resolve(res);
  //     });
  //   });

  //   return response;
  // }

  async pong() {
    console.log("inside pong")
    const res = await this.pongGrpc()
    console.log("response is  : ", res)
    return res;
  }

  async pongGrpc(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.grpcClient.pong({}, (err, response) => {
        if (err) {
          console.error("gRPC Error: ", err);
          return reject(err);
        }
        resolve(response);
      });
    });
  }

  // async pong() {
  //   console.log("inside the pong")
  //   return new Promise<{ pong: string }>((resolve, reject) => {
  //     this.client.getService<any>("BookStockService").pong({}, (err, response) => {
  //       if (err) {
  //         console.error("gRPC pong error:", err);
  //         return reject(new Error("Failed to pong: " + err.message));
  //       }
  //       resolve(response);
  //     });
  //   });
  // }


  async findAll(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id);
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.bookModel.findByIdAndUpdate(id, updateBookDto, { new: true });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async remove(id: string): Promise<{ message: string }> {
    const book = await this.bookModel.findByIdAndDelete(id);
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return { message: `Book with ID ${id} deleted successfully` };
  }

  async grpcMethod<TReq = any, TRes = any, TMethod = any>(methodName: TMethod, payload: TReq = {} as TReq): Promise<TRes> {
    // console.log("Inside the GRPC METHOD", methodName )
    return new Promise((resolve, reject) => {
      const method = (this.grpcClient as any)[methodName];
      // console.log("Inside the GRPC METHOD 1", method)

      if (typeof method !== 'function') {
        console.log("Inside the GRPC METHOD 2")

        return reject(new Error(`Method ${methodName} does not exist on gRPC client`));
      }
      console.log("Inside the GRPC METHOD 3")

      method.call(this.grpcClient, payload, (err: any, res: TRes) => {
        if (err) {
          console.error(`gRPC Error in method ${methodName}:`, err);
          return reject(err);
        }
        console.log(res)
        resolve(res);
      });
    });
  }

}
