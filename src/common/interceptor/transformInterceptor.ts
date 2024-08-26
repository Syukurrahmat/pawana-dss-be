import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Response<T> {
    statusCode: number;
    message: string;
    error: string;
    data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data) => ({
                statusCode,
                message: statusCode >= 400 ? 'Error' : 'Success',
                error: statusCode >= 400 ? response.message : null,
                data,
            })),

            catchError((err) => {
                const statusCode = err instanceof HttpException ? err.getStatus() : 500;
                const errorResponse = {
                    statusCode,
                    message: err?.response?.message || err?.message || 'Internal server error',
                    error: err?.name || 'Error',
                    data: {},
                };

                return throwError(() => new HttpException(errorResponse, statusCode));
            })
        );
    }
}
