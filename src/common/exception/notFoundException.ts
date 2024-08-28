import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { publicDir } from '../../lib/common.utils';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
	catch(exception: NotFoundException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		return response.sendFile(publicDir('index.app.html'));

		// const proxy = createProxyMiddleware({
		// 	target: 'http://localhost:5173/',
		// 	changeOrigin: true,
		// });

		// proxy(ctx.getRequest(), response, (err) => {
		// 	if (err) {
		// 		response.status(500).send('Proxy failed.');
		// 	}
		// });

	}
}
