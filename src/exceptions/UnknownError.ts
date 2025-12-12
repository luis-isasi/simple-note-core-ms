import { HttpStatusCode } from '../controller/BaseController';
import { AbstractError, ErrorProps } from './AbstractError';

export class UnknownError extends AbstractError {
  constructor(props: ErrorProps) {
    super({
      name: 'UnknownError',
      httpErrorCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      code: props?.code,
      message: props?.message || 'Unknown error',
      detail: props?.detail,
    });
  }
}
