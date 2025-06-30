import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EXCLUDE_ENDPOINTS } from '../decorators/exclude.decorator';
import { match } from 'path-to-regexp';

@Injectable()
export class Dynamic_JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        try {
            const request = context.switchToHttp().getRequest<Request>();
            const excludedRoutes = this.reflector.get<{ method: string, url: string }[]>(EXCLUDE_ENDPOINTS, context.getHandler());

            const { method, url } = request;
            const { token } = request.cookies;

            console.log('Cookies:', request.cookies);
            console.log('Request Method:', method);
            console.log('Request URL:', url);
            console.log('Excluded Routes:', excludedRoutes);

            const isExcluded = excludedRoutes.some(route => {
                const routeMatcher = match(route.url, { decode: decodeURIComponent });
                console.log('Token1:', route.url, route.method, routeMatcher(url), method, url, url === route.url);

                return route.method === method && routeMatcher(url);
            });

            if (isExcluded) {
                return true;
            }

            if (!token) {
                throw new UnauthorizedException('No token provided');
            }
                                                                                                                                                                                                                                                                                                                    
            console.log('Token is this:', token);


            const decoded = this.jwtService.verify(token);
            request.user = decoded;
            console.log('Decoded Token:', decoded);
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
