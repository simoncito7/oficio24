import { NotFoundException, BadRequestException, InternalServerErrorException, ArgumentsHost } from "@nestjs/common";
import { HttpExceptionFilter } from "../http-exception.filter.js";

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  function createHost() {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });

    const host = {
          switchToHttp: () => ({
            getResponse: () => ({ status }),
            getRequest: () => ({
              method: 'GET',
              url: 'api/v1/test',
            }),
          }),
        } as ArgumentsHost;

    return { host, status, json };
  }

  it('should format a 404 exception', () => {
    const { host, status, json } = createHost();

    filter.catch(new NotFoundException('Resource not found'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'Resource not found',
        path: 'api/v1/test',
      })
    )
  })

  it('should preserve validation error messages', () => {
    const { host, status, json } = createHost();

    filter.catch(
          new BadRequestException(['email must be valid']),
          host,
        );

    expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: ['email must be valid'],
          }),
        );
  })

  it('should hide internal server error details', () => {
      const { host, status, json } = createHost();

      filter.catch(
        new InternalServerErrorException('Database password exposed'),
        host,
      );

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Internal server error',
        }),
      );
    });
})
