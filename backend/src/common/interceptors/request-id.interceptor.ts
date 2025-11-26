import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get or generate request ID
    const requestId = request.headers['x-request-id'] as string || uuidv4();

    // Add request ID to request object for use in controllers/services
    (request as any).requestId = requestId;

    // Add request ID to response headers
    response.setHeader('X-Request-ID', requestId);

    return next.handle();
  }
}

