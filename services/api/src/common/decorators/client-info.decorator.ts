import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ClientInfo {
  ip: string;
  userAgent: string;
}

export const ClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClientInfo => {
    const request = ctx.switchToHttp().getRequest();
    
    const ip = request.ip || 
               request.connection?.remoteAddress || 
               request.socket?.remoteAddress ||
               (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
               'unknown';

    const userAgent = request.headers['user-agent'] || 'unknown';

    return { ip, userAgent };
  },
);
