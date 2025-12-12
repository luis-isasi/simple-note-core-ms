import { HttpStatusCode } from '../controller/BaseController';
import { AbstractError, ErrorProps } from './AbstractError';

export class ForbiddenError extends AbstractError {
  constructor(props: ErrorProps) {
    super({
      name: 'ForbiddenError',
      httpErrorCode: HttpStatusCode.FORBIDDEN,
      code: props?.code,
      message: props?.message || 'Forbidden',
      detail: props?.detail,
    });
  }
}
