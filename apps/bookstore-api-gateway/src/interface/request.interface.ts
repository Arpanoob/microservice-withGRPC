import { Request } from 'express';

export interface AuthReq extends Request {
    customParams?: Record<string, any>;
    user?: any;
    divertUrl?:string;
}
