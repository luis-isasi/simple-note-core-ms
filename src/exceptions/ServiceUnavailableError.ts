import { HttpStatusCode } from '../controller/BaseController';
import { AbstractError, ErrorProps } from './AbstractError';

export class ServiceUnavailableError extends AbstractError {
  constructor(props: ErrorProps) {
    super({
      name: 'ServiceUnavailableError',
      httpErrorCode: HttpStatusCode.SERVICE_UNAVAILABLE,
      code: props?.code,
      message: props?.message || 'Service Unavailable',
      detail: props?.detail,
    });
  }
}
