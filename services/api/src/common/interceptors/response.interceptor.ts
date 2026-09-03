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
        const sanitizedData = this.removeSensitiveFields(data);
        // If response already has the standard format, return as-is
        if (
          sanitizedData &&
          typeof sanitizedData === 'object' &&
          'success' in sanitizedData &&
          'request_id' in sanitizedData
        ) {
          return sanitizedData;
        }

        // Transform to standard format
        return {
          success: true,
          message: sanitizedData?.message || 'Request successful',
          data: sanitizedData?.data !== undefined ? sanitizedData.data : sanitizedData,
          request_id: requestId,
        };
      }),
    );
  }

  private removeSensitiveFields(value: any): any {
    if (Array.isArray(value)) return value.map((item) => this.removeSensitiveFields(item));
    if (!value || typeof value !== 'object') return value;

    const sanitized: Record<string, any> = {};
    for (const [key, child] of Object.entries(value)) {
      if (['password_hash', 'jwt_secret', 'mqtt_password', 'api_key', 'service_role_key', 'database_url'].includes(key.toLowerCase())) continue;
      sanitized[key] = this.removeSensitiveFields(child);
    }
    return sanitized;
  }
}
