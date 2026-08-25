import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * HTTP Exception Filter for Standardized Error Responses
 * 
 * Catches all HTTP exceptions and transforms them into the standard format:
 * {
 *   success: false,
 *   message: "...",
 *   error: {
 *     code: "...",
 *     details: []
 *   },
 *   request_id: "..."
 * }
 * 
 * Never exposes stack traces, secrets, or internal implementation details.
 * 
 * Phase 1 Foundation - Architectural placeholder
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const requestId = request.headers['x-request-id'] || uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        
        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          details = responseObj.message;
          errorCode = 'VALIDATION_ERROR';
        }
      }

      // Map HTTP status to error codes
      errorCode = this.mapStatusToErrorCode(status);
    } else if (exception instanceof Error) {
      // Log the actual error for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse = {
      success: false,
      message: this.sanitizeMessage(message),
      error: {
        code: errorCode,
        details: this.sanitizeDetails(details),
      },
      request_id: requestId,
    };

    response.status(status).json(errorResponse);
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  private sanitizeMessage(message: string): string {
    // Remove any potential sensitive information from error messages
    // This is a basic implementation - enhance as needed
    return message
      .replace(/password/i, '***')
      .replace(/secret/i, '***')
      .replace(/token/i, '***')
      .replace(/api[_-]?key/i, '***');
  }

  private sanitizeDetails(details: string[]): string[] {
    // Sanitize each detail to prevent information leakage
    return details.map((detail) => this.sanitizeMessage(detail));
  }
}
