import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseFormatMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const originalJson = res.json;
        console.log("inside response middleware", (req)?.path)
        res.json = function ({ status, message, data }: any) {
            console.log("at end??")
            const { token } = data;
            if (req.path === "/gateway/user-service/user/login" && token) {
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                });
            }
            const formattedResponse = {
                status,
                message,
                data,
            };
            return originalJson.call(this, formattedResponse);
        };

        next();
    }
}
