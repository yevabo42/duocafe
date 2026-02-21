import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface HttpResponse {
  status(code: number): { send(body: unknown): void };
}

interface HttpRequest {
  url: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<HttpResponse>();
    const request = ctx.getRequest<HttpRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorBody =
      typeof message === 'string' ? { message } : (message as object);

    reply.status(status).send({
      success: false,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...errorBody,
      },
    });
  }
}
