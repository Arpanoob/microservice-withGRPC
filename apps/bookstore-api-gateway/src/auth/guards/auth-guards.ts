import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        console.log(request.cookies)
        const { token } = request.cookies;

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }
        console.log(token)

        try {
            const decoded = this.jwtService.verify(token);
            request.user = decoded;
            console.log("fdecoded", decoded)
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

