import { HttpStatusCode } from '../controller/BaseController';

export interface AbstractErrorProps {
  name: string;
  httpErrorCode: HttpStatusCode;
  code: string;
  message: string;
  detail?: string;
}

export type ErrorProps = Pick<
  AbstractErrorProps,
  'code' | 'message' | 'detail'
>;

export class AbstractError extends Error {
  constructor(public props: AbstractErrorProps) {
    super(props.message);
    this.name = props.name;
  }

  getApiHttpCode() {
    return this.props.httpErrorCode;
  }

  getApiData() {
    return {
      code: this.props.code || 'unknown',
      message: this.message,
    };
  }
}
