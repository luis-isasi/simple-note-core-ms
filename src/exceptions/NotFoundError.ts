import { HttpStatusCode } from '../controller/BaseController';
import { AbstractError, ErrorProps } from './AbstractError';

export class NotFoundError extends AbstractError {
  constructor(props: ErrorProps) {
    super({
      name: 'NotFoundError',
      httpErrorCode: HttpStatusCode.NOT_FOUND,
      code: props?.code,
      message: props?.message || 'Not found',
      detail: props?.detail,
    });
  }
}
