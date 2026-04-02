import { BaseController } from '../BaseController';
import { AbstractError } from '../../exceptions/AbstractError';
import { UnknownError } from '../../exceptions/UnknownError';
import { BadRequestError } from '../../exceptions/BadRequestError';

class TestController extends BaseController {}

describe('BaseController', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  describe('apiResponseOk', () => {
    it('returns 200 with body when body is provided', () => {
      const result = controller.apiResponseOk({ data: 'test' });
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(JSON.stringify({ data: 'test' }));
    });

    it('returns 200 without body when no argument is passed', () => {
      const result = controller.apiResponseOk();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toBeUndefined();
    });
  });

  describe('apiResponseCreated', () => {
    it('returns 201 with body', () => {
      const result = controller.apiResponseCreated({ id: '1' });
      expect(result.statusCode).toEqual(201);
      expect(result.body).toEqual(JSON.stringify({ id: '1' }));
    });

    it('returns 201 without body when no argument is passed', () => {
      const result = controller.apiResponseCreated();
      expect(result.statusCode).toEqual(201);
      expect(result.body).toBeUndefined();
    });
  });

  describe('apiResponseAccepted', () => {
    it('returns 202 with body', () => {
      const result = controller.apiResponseAccepted({ queued: true });
      expect(result.statusCode).toEqual(202);
      expect(result.body).toEqual(JSON.stringify({ queued: true }));
    });

    it('returns 202 without body when no argument is passed', () => {
      const result = controller.apiResponseAccepted();
      expect(result.statusCode).toEqual(202);
      expect(result.body).toBeUndefined();
    });
  });

  describe('apiResponseError', () => {
    it('returns the http code from a known AbstractError', () => {
      const error = new BadRequestError({ code: 'bad_request', message: 'invalid' });
      const result = controller.apiResponseError(error);
      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body)).toMatchObject({ code: 'bad_request', message: 'invalid' });
    });

    it('returns 500 for an unknown Error', () => {
      const result = controller.apiResponseError(new Error('boom'));
      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body)).toMatchObject({ code: '1.1.1' });
    });

    it('returns 500 when no error is provided', () => {
      const result = controller.apiResponseError(undefined);
      expect(result.statusCode).toEqual(500);
    });
  });

  describe('getErrorWrapper', () => {
    it('returns the same AbstractError instance when given one', () => {
      const error = new UnknownError({ code: 'unknown', message: 'oops' });
      expect(controller.getErrorWrapper(error)).toBe(error);
    });

    it('returns an UnknownError when given a plain Error', () => {
      const wrapper = controller.getErrorWrapper(new Error('plain'));
      expect(wrapper).toBeInstanceOf(AbstractError);
      expect(wrapper.getApiData().code).toEqual('1.1.1');
    });
  });
});
