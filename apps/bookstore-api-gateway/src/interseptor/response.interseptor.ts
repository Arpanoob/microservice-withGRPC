import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response: Response = ctx.getResponse();

        console.log("Inside response interceptor", request.path);

        return next.handle().pipe(
            map(({ data, status, message }) => {
                console.log("==>", data)
                const { token=null } = data || {};
                if (request.path === "/gateway/user-service/user/login") {

                    response.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                    });
                }

                return {
                    status,
                    message,
                    data,
                };
            }),
        );
    }
}
