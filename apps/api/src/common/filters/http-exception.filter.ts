import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
          ? exception.getResponse()
          : null;

    const details =
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null
            ? exceptionResponse as Record<string, unknown>
            : {};

    const message =
      statusCode >= 500
        ? 'Internal server error'
        : isHttpException
          ? (details.message ?? exception.message)
          : 'Internal server error';

    const error =
      statusCode >= 500
        ? 'Internal Server Error'
        : typeof details.error === 'string'
          ? details.error
          : exception instanceof HttpException
            ? exception.name.replace(/Exception$/, '').replace(/([a-z])([A-Z])/g, '$1 $2')
            : 'Error';

    if (!isHttpException || statusCode >= 500) {
          this.logger.error(
            `${request.method} ${request.url} - ${statusCode}`,
            exception instanceof Error ? exception.stack : String(exception),
          );
    }

    response.status(statusCode).json({
          statusCode,
          error,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });

  }
}
