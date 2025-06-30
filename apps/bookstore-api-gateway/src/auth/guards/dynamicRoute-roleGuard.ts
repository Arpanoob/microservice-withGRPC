import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleMetadata } from '../decorators/dynamic-roles.decorator'
import { match } from 'path-to-regexp';
import { EXCLUDE_ENDPOINTS } from '../decorators/exclude.decorator';
import { parse } from 'url';


@Injectable()
export class DynamicRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log("Enterred in Role Gaurd")
        const request = context.switchToHttp().getRequest();
        const roleDataArray = this.reflector.get<RoleMetadata[]>(ROLES_KEY, context.getHandler());
        const excludedRoutes = this.reflector.get<{ method: string, url: string }[]>(EXCLUDE_ENDPOINTS, context.getHandler());
        const { user, method, url, params } = request;
        const isExcluded = excludedRoutes.some(route => {
            const routeMatcher = match(route.url, { decode: decodeURIComponent });
            return route.method === method && routeMatcher(url);
        });
        if (isExcluded) {
            return true;
        }

        if (!roleDataArray || roleDataArray.length === 0) {
            return false;
        }
        const tobe = match("/users/:id/:io", { decode: decodeURIComponent })
        // console.dir(tobe("/users/1/1").params.id, { depth: null });

        if (!user || !user.role) {
            throw new ForbiddenException('Access Denied');
        }

        let requestPath = request.originalUrl;
        requestPath = requestPath.replace("/gateway/" + params.serviceName, "")

        console.log('User Role:', user.role);
        console.log('Request Path:', requestPath);
        console.log('Allowed Roles & Endpoints:', roleDataArray);

        const isAuthorized = roleDataArray.some((roleData) => {
            const routeMatcher = match(roleData.endpoint, { decode: decodeURIComponent });
            console.log(roleData.endpoint, requestPath)
            const parsedUrl = parse(requestPath, true);
            const requestPathWithoutQuery = parsedUrl.pathname;

            const result = routeMatcher(requestPathWithoutQuery!)
            if (!result) {
                return false;
            }
            request.customParams = (result as { params: any })?.params;
            request.divertUrl = request.originalUrl;

            if (request.customParams) {
                // const basePath = result.path.split('/').slice(0, -Object.keys(result.params).length).join('/');
                // const basePath = roleData.endpoint.replace(/:\w+/g, '').replace(/\/+/g, '/'); // "booksStock/decreaseStock"
                const basePath = roleData.endpoint
                .replace(/:\w+/g, '') // Remove dynamic params
                .replace(/\/+/g, '/') // Fix double slashes
                .replace(/\/$/, '');  
                request.divertUrl = basePath;
                console.log(basePath, " is base path",result)
            }
            console.log("====+=====++===", request.customParams, result, roleData.endpoint, requestPath)
            return roleData.role.includes(user.role) && method === roleData.method;
        });

        if (!isAuthorized) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
