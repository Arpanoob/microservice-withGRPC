import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { ClientKafka, ClientProxy } from "@nestjs/microservices";
import { Inject } from "@nestjs/common";
import { CreateOrderDto } from "@app/contracts/orders/create-order.dto";
import { UpdateOrderDto } from "@app/contracts/orders/update-order.dto";
import { Order } from "./entities/order.entity";
import { firstValueFrom } from "rxjs";
import * as protoLoader from "@grpc/proto-loader";

import * as grpc from "@grpc/grpc-js";

import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const PROTO_DEST_BOOKSTORE = path.join(
  process.cwd(),
  "apps/orders/src/proto/bookstock.proto"
);
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
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @Inject("BOOKSTOCK_CLIENT") private readonly bookStockClient: ClientProxy,
    @Inject("USERS_CLIENT") private readonly userClient: ClientProxy,
    @Inject("BOOKSTORE_KAFKA_CLIENT") private BookStoreKafkaClient: ClientKafka,
    @Inject("USERS_KAFKA_CLIENT") private UserKafkaClient: ClientKafka
  ) {}
  private grpcClient;
  private grpcClientAsync: Record<string, Function> = {};
  async onModuleInit() {
    const res = await firstValueFrom(
      this.bookStockClient.send("bookStock.proto", {})
    );
    const buffer = Buffer.from(res.file.data);
    const protoText = buffer.toString("utf-8");

    fs.mkdirSync(path.dirname(PROTO_DEST_BOOKSTORE), { recursive: true });
    fs.writeFileSync(PROTO_DEST_BOOKSTORE, protoText);

    const packageDefinition = protoLoader.loadSync(PROTO_DEST_BOOKSTORE, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    const bookstockPackage = proto.bookstock;
    this.grpcClient = new bookstockPackage.BookStockService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );

    // this.grpcClientAsync[methodName] = promisify(
    //   this.grpcClient[methodName]
    // ).bind(this.grpcClient);
  }

  async create(createOrderDto: CreateOrderDto) {
    const { userId, orders } = createOrderDto;

    const stockCheckResults = await Promise.all(
      orders.map(
        async (order) =>
          await this.grpcClient({
            book: order.book,
            quantity: order.quantity,
          })
      )
    );

    if (stockCheckResults.some((result) => !result.available)) {
      throw new BadRequestException(`Insufficient stock for one or more books`);
    }

    await Promise.all(
      orders.map((order) =>
        this.bookStockClient.emit("bookStock.decreaseStock", {
          book: order.book,
          quantity: order.quantity,
        })
      )
    );
    //DecreaseStock
    const newOrder = new this.orderModel(createOrderDto);
    await newOrder.save();

    // const or = await firstValueFrom(this.userClient.send('user.update', {
    //   userId,
    //   updateUserDto: { OwnBooks: orders.map(o => ({ book: o.book, quantity: o.quantity })) }
    // }));
    this.UserKafkaClient.emit("user.update", {
      userId,
      updateUserDto: {
        OwnBooks: orders.map((o) => ({ book: o.book, quantity: o.quantity })),
      },
    });

    return newOrder;
  }

  async findAll() {
    return this.orderModel.find().populate("orders.book");
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id); //.populate('orders.book')//.populate('userId');
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      updateOrderDto,
      { new: true }
    );
    if (!updatedOrder) throw new NotFoundException("Order not found");
    return updatedOrder;
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id);
    if (!order) throw new NotFoundException("Order not found");
    return { message: "Order deleted successfully" };
  }

  async grpcMethod(methodName, payload) {
    const methodToCall = this.grpcClient[methodName];
    if (typeof methodToCall !== "function") {
      throw new Error("Method does not exist");
    }
    methodToCall.call(this.grpcClient, payload, (err, res) => {
      if (err) {
        console.log("here error is  : ", err);
        return;
      }
      console.log("here response is  : ", res);
    });
  }
}
