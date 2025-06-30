import { All, Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { BookstoreApiGatewayService } from './bookstore-api-gateway.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './auth/guards/auth-guards';
import { RolesGuard } from './auth/guards/role.gaurds';
import { DynamicRolesGuard } from './auth/guards/dynamicRoute-roleGuard';
import { Roles } from './auth/decorators/dynamic-roles.decorator';
import { Dynamic_JwtAuthGuard } from './auth/guards/dynamic-route-authguard';
import { ExcludeEndPoints } from './auth/decorators/exclude.decorator';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { AuthReq } from './interface/request.interface';

@Controller('gateway')
export class BookstoreApiGatewayController {
  constructor(private readonly gatewayService: BookstoreApiGatewayService) { }

  @ExcludeEndPoints({ method: "POST", url: "/gateway/user-service/user/create" }, { method: "POST", url: "/gateway/user-service/user/login" })
  @Roles(
    //users
    { role: ["admin", "user"], endpoint: "/user/create", method: "GET" },
    { role: ["admin", "user"], endpoint: "/user/findOne/:userId", method: "GET" },
    { role: ["admin", "user"], endpoint: "/user/update/:userId", method: "PATCH" },
    { role: ["admin"], endpoint: "/user/delete/:userId", method: "DELETE" },
    { role: ["admin", "user"], endpoint: "/orders/create", method: "POST" },
    { role: ["admin", "user"], endpoint: "/user/logout", method: "POST" },
    //book
    { role: ["admin", "user"], endpoint: "/books/createBook", method: "POST" },
    { role: ["admin", "user"], endpoint: "/books/findAllBooks", method: "GET" },
    { role: ["admin", "user"], endpoint: "/books/findOneBook/:id", method: "GET" },
    { role: ["admin", "user"], endpoint: "/books/updateBook/:id", method: "PATCH" },
    { role: ["admin"], endpoint: "/books/removeBook/:id", method: "DELETE" },
    //bookstore
    { role: ["admin", "user"], endpoint: "/bookStock/create", method: "POST" },
    { role: ["admin", "user"], endpoint: "/bookStock/findOne/:id", method: "GET" },
    { role: ["admin", "user"], endpoint: "/bookStock/checkStock/:book", method: "GET" },
    { role: ["admin", "user"], endpoint: "/bookStock/findStock/:id", method: "GET" },
    { role: ["admin", "user"], endpoint: "/bookStock/update/:id", method: "PATCH" },
    { role: ["user"], endpoint: "/bookStock/remove/:id", method: "DELETE" },
    { role: ["admin"], endpoint: "/bookstock/:id/check-stock/:quantity", method: "GET" },
    { role: ["admin"], endpoint: "/bookStock/:book/decreaseStock/:quantity", method: "PATCH" },
    { role: ["admin"], endpoint: "/bookStock/:bookId/increaseStock/:quantity", method: "PATCH" },
    //orders 
    { role: ["admin", "user"], endpoint: "/orders/create", method: "POST" },
    { role: ["admin", "user"], endpoint: "/orders/findAll", method: "GET" },
    { role: ["admin", "user"], endpoint: "/orders/findOne/:id", method: "GET" },
    { role: ["admin", "user"], endpoint: "/orders/update/:id", method: "PATCH" },
    { role: ["user"], endpoint: "/orders/remove/:id", method: "DELETE" }

  )
  @UseGuards(Dynamic_JwtAuthGuard, DynamicRolesGuard)
  @All(':serviceName/*')
  async forwardDynamicRequest(
    @Param('serviceName') serviceName: string,
    @Param('*') path: string,
    @Query() query: any,
    @Body() body: any,
    @Req() req: AuthReq,
  ) {
    try {
      const basePath = `/gateway/${serviceName}/`;
      const extractedPath = req?.divertUrl?.replace(basePath, '') || req?.originalUrl?.replace(basePath, '');

      const customParams = req.customParams ?? {};

      console.log("inside controller",query,body,customParams)
      const { data } = await this.gatewayService.forwardRequest(
        serviceName,
        extractedPath,
        req.method,
        { ...query, ...customParams, ...body }
      );

      return {
        status: HttpStatus.OK,
        message: "Sucesss",
        data
      }
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      }
    }
  }
}
