import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';


@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const proxy = createProxyMiddleware({
            target: 'http://localhost:5173', 
            changeOrigin: true,
        });

        proxy(request, response, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                response.status(500).send('Internal server error');
            }
        });
    }
}

