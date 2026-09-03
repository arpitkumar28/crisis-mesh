import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

/**
 * Response Interceptor for Standardized API Responses
 *
 * Transforms all successful responses into the standard format:
 * {
 *   success: true,
 *   message: "...",
 *   data: {},
 *   request_id: "..."
 * }
 *
 * Phase 1 Foundation - Architectural placeholder
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || uuidv4();

    return next.handle().pipe(
      map((data) => {
        // If response already has the standard format, return as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'request_id' in data
        ) {
          return data;
        }

        // Transform to standard format
        return {
          success: true,
          message: data?.message || 'Request successful',
          data: data?.data !== undefined ? data.data : data,
          request_id: requestId,
        };
      }),
    );
  }
}
