import { v4 as uuidv4 } from 'uuid';
import { AbstractError } from '../exceptions/AbstractError';
import { UnknownError } from '../exceptions/UnknownError';
import { APIGatewayProxyResult } from 'aws-lambda';

// export const CORS_HEADERS = {
//   'Access-Control-Allow-Headers':
//     'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD',
// };

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export class BaseController {
  constructor() {}

  protected getUuid(): string {
    return uuidv4();
  }

  public apiResponseOk(body?: any): APIGatewayProxyResult {
    return {
      statusCode: HttpStatusCode.OK,
      // headers: CORS_HEADERS,
      isBase64Encoded: false,
      ...(body && { body: JSON.stringify(body) }),
    };
  }

  public apiResponseAccepted(body?: any): APIGatewayProxyResult {
    return {
      statusCode: HttpStatusCode.ACCEPTED,
      // headers: CORS_HEADERS,
      isBase64Encoded: false,
      ...(body && { body: JSON.stringify(body) }),
    };
  }

  public apiResponseError(error?: Error): APIGatewayProxyResult {
    const wrapper = this.getErrorWrapper(error);

    return {
      statusCode: wrapper.getApiHttpCode(),
      // headers: CORS_HEADERS,
      body: JSON.stringify(wrapper.getApiData()),
      isBase64Encoded: false,
    };
  }

  public getErrorWrapper(error?: Error): AbstractError {
    if (error && error instanceof AbstractError) {
      return error;
    }

    return new UnknownError({ message: 'Unknown error', code: 'unknown' });
  }
}
