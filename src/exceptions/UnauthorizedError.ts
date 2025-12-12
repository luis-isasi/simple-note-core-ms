import { HttpStatusCode } from '../controller/BaseController';
import { AbstractError, ErrorProps } from './AbstractError';

export class UnauthorizedError extends AbstractError {
  constructor(props: ErrorProps) {
    super({
      name: 'UnauthorizedError',
      httpErrorCode: HttpStatusCode.UNAUTHORIZED,
      code: props?.code,
      message: props?.message || 'Unauthorized',
      detail: props?.detail,
    });
  }
}
