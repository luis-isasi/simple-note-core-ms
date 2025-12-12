import { HttpStatusCode } from '../controller/BaseController';
import { AbstractError, ErrorProps } from './AbstractError';

export class BadRequestError extends AbstractError {
  constructor(props: ErrorProps) {
    super({
      name: 'BadRequestError',
      httpErrorCode: HttpStatusCode.BAD_REQUEST,
      code: props?.code,
      message: props?.message || 'Bad request',
      detail: props?.detail,
    });
  }
}
