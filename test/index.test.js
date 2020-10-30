/* eslint max-statements:0 */

const assume = require('assume');
const { describe, it, before, beforeEach, after, afterEach } = require('mocha');
const nock = require('nock');
const sinon = require('sinon');

const ServiceMeow = require('..');
const OperationException = require('../exceptions/operation-exception');
const { QueryBuilder } = ServiceMeow;

describe('ServiceMeow', function () {
  /** @type {ServiceMeow} */
  let serviceMeow;

  beforeEach(function () {
    serviceMeow = new ServiceMeow('http://venXXXXX.service-now.com', 'user', 'pass');
  });

  describe('_request', function () {
    /** @type {nock.Scope} */
    let nockScope;
    before(function () {
      nock.disableNetConnect();
      nockScope = nock('http://venXXXXX.service-now.com', { encodedQueryParams: true });
    });

    after(function () {
      nock.restore();
      nock.enableNetConnect();
    });

    it('is an async function', function () {
      // @ts-expect-error
      assume(serviceMeow._request).is.an('asyncfunction');
    });

    it('handles single-item paths', async function () {
      nockScope.get('/api/now/table/test_table')
        .reply(200, { meow: 'purr' });
      // @ts-expect-error
      const response = await serviceMeow._request('test_table');
      assume(nockScope.isDone()).is.true();
      assume(response).is.an('object');
      assume(response).hasOwn('meow', 'purr');
    });

    it('handles multi-item paths', async function () {
      nockScope.get('/api/now/table/test_table/test_id')
        .reply(200, { meow: 'purr' });
      // @ts-expect-error
      const response = await serviceMeow._request(['test_table', 'test_id']);
      assume(nockScope.isDone()).is.true();
      assume(response).is.an('object');
      assume(response).hasOwn('meow', 'purr');
    });

    it('includes query string', async function () {
      nockScope.get('/api/now/table/test_table')
        .query({
          hiss: 'hork',
          yo: 'item%20with%20space%25'
        })
        .reply(200, { meow: 'purr' });
      // @ts-expect-error
      const response = await serviceMeow._request('test_table', {
        hiss: 'hork',
        yo: 'item with space%'
      });
      assume(nockScope.isDone()).is.true();
      assume(response).is.an('object');
      assume(response).hasOwn('meow', 'purr');
    });

    it('handles other verbs', async function () {
      nockScope.post('/api/now/table/test_table')
        .reply(204);
      // @ts-expect-error
      await serviceMeow._request('test_table', null, 'POST');
      assume(nockScope.isDone()).is.true();
    });

    it('handles request body', async function () {
      nockScope.post('/api/now/table/test_table', { meow: 'purr' })
        .reply(201);
      // @ts-expect-error
      await serviceMeow._request('test_table', null, 'POST', { meow: 'purr' });
      assume(nockScope.isDone()).is.true();
    });

    it('uses response selector', async function () {
      nockScope.get('/api/now/table/test_table')
        .reply(200, null, { 'x-mock-header': 'meow' });
      // @ts-expect-error
      const mockHeader = await serviceMeow._request('test_table', null, 'GET', null,
        (res) => res.headers.get('x-mock-header'));
      assume(nockScope.isDone()).is.true();
      assume(mockHeader).equals('meow');
    });

    it('handles fetch error', async function () {
      nockScope.get('/api/now/table/test_table')
        .replyWithError(new Error('inner'));
      let caught = false;
      try {
        // @ts-expect-error
        await serviceMeow._request('test_table');
      } catch (err) {
        caught = true;
        assume(err).is.truthy();
        assume(err).is.instanceOf(OperationException);
        assume(err.message).contains(
          'Error while performing specified operation on http://venXXXXX.service-now.com. Error: ' +
          'FetchError: request to http://venxxxxx.service-now.com/api/now/table/test_table failed, reason: inner');
        assume(err).hasOwn('innerError');
        assume(err.innerError).is.instanceOf(Error);
        assume(err.innerError.message).equals(
          'request to http://venxxxxx.service-now.com/api/now/table/test_table failed, reason: inner');
      }
      assume(caught).is.true();
    });

    it('handles non-ok response', async function () {
      nockScope.get('/api/now/table/test_table')
        .reply(500);
      let caught = false;
      try {
        // @ts-expect-error
        await serviceMeow._request('test_table');
      } catch (err) {
        caught = true;
        assume(err).is.truthy();
        assume(err).is.instanceOf(OperationException);
        assume(err.message).contains(
          'Error while performing specified operation on http://venXXXXX.service-now.com. Error code: 500, ' +
          'error: Internal Server Error');
      }
      assume(caught).is.true();
    });
  });

  /**
  * @callback ResponseSelector
  * @param {Response} res Response object from fetch
  * @returns {any} Whatever data is needed from the response
  */

  describe('Public methods', function () {
    /** @type {sinon.SinonStub<[string | string[], any?, string?, any?, ResponseSelector?], Promise<any>>} */
    let requestStub;
    beforeEach(function () {
      // @ts-expect-error
      requestStub = sinon.stub(serviceMeow, '_request');
    });

    afterEach(function () {
      sinon.restore();
    });

    describe('getRecords', function () {
      it('is an async function', function () {
        assume(serviceMeow.getRecords).is.an('asyncfunction');
        assume(serviceMeow.getRecords).has.length(2);
      });

      it('makes a valid request', async function () {
        await serviceMeow.getRecords('test_table');
        assume(requestStub.calledWith('test_table', sinon.match.object)).is.true();
      });

      it('handles raw query string', async function () {
        await serviceMeow.getRecords('test_table', 'mock_query');
        assume(requestStub.calledWith('test_table', sinon.match({
          sysparm_query: 'mock_query'
        }))).is.true();
      });

      it('handles QueryBuilders', async function () {
        const q = new QueryBuilder();
        q.field('meow').equals('purr');
        const qBuild = sinon.spy(q, 'build');
        await serviceMeow.getRecords('test_table', q);
        assume(requestStub.calledWith('test_table', sinon.match({
          sysparm_query: 'meow=purr'
        }))).is.true();
        assume(qBuild.called).is.true();
      });
    });

    describe('getRecordCount', function () {
      it('is an async function', function () {
        assume(serviceMeow.getRecordCount).is.an('asyncfunction');
        assume(serviceMeow.getRecordCount).has.length(2);
      });

      it('makes a valid request', async function () {
        await serviceMeow.getRecordCount('test_table');
        assume(requestStub.calledWith('test_table', sinon.match.object)).is.true();
      });

      it('handles raw query string', async function () {
        await serviceMeow.getRecordCount('test_table', 'mock_query');
        assume(requestStub.calledWith('test_table', sinon.match({
          sysparm_query: 'mock_query'
        }))).is.true();
      });

      it('handles QueryBuilders', async function () {
        const q = new QueryBuilder();
        q.field('meow').equals('purr');
        const qBuild = sinon.spy(q, 'build');
        await serviceMeow.getRecordCount('test_table', q);
        assume(requestStub.calledWith('test_table', sinon.match({
          sysparm_query: 'meow=purr'
        }))).is.true();
        assume(qBuild.called).is.true();
      });

      it('counts records', async function () {
        requestStub.resolves({
          result: [
            'meow',
            'purr'
          ]
        });
        const count = await serviceMeow.getRecordCount('test_table', 'mock_query');
        assume(count).equals(2);
      });
    });

    describe('createRecord', function () {
      it('is an async function', function () {
        assume(serviceMeow.createRecord).is.an('asyncfunction');
        assume(serviceMeow.createRecord).has.length(2);
      });

      it('creates a record and returns id', async function () {
        requestStub.resolves({
          result: {
            sys_id: 'MOCK_ID'
          }
        });
        const mockBody = { meow: 'purr' };
        const res = await serviceMeow.createRecord('test_table', mockBody);
        assume(requestStub.calledWith('test_table', null, 'POST', sinon.match(mockBody))).is.true();
        assume(res).equals('MOCK_ID');
      });
    });

    describe('getSingleRecord', function () {
      it('is an async function', function () {
        assume(serviceMeow.getSingleRecord).is.an('asyncfunction');
        assume(serviceMeow.getSingleRecord).has.length(2);
      });

      it('requests a single record', async function () {
        await serviceMeow.getSingleRecord('test_table', 'test_id');
        assume(requestStub.calledWith(sinon.match.array.deepEquals(['test_table', 'test_id']))).is.true();
      });
    });

    describe('updateSingleRecord', function () {
      it('is an async function', function () {
        assume(serviceMeow.updateSingleRecord).is.an('asyncfunction');
        assume(serviceMeow.updateSingleRecord).has.length(3);
      });

      it('updates a single record', async function () {
        requestStub.resolves({
          result: {
            sys_id: 'test_id'
          }
        });
        const mockBody = { meow: 'purr' };
        const res = await serviceMeow.updateSingleRecord('test_table', mockBody, 'test_id');
        assume(requestStub.calledWith(
          sinon.match.array.deepEquals(['test_table', 'test_id']), null, 'PUT', sinon.match(mockBody))).is.true();
        assume(res).equals('test_id');
      });
    });

    describe('deleteSingleRecord', function () {
      it('is an async function', function () {
        assume(serviceMeow.deleteSingleRecord).is.an('asyncfunction');
        assume(serviceMeow.deleteSingleRecord).has.length(2);
      });

      it('deletes a single record', async function () {
        // eslint-disable-next-line max-params, max-nested-callbacks
        requestStub.callsFake(async (path, query, method, body, responseSelector) => {
          // @ts-expect-error
          assume(responseSelector({ status: 204 })).is.true();
          // @ts-expect-error
          assume(responseSelector({ status: 200 })).is.false();
        });
        await serviceMeow.deleteSingleRecord('test_table', 'test_id');
        assume(requestStub.calledWith(
          sinon.match.array.deepEquals(['test_table', 'test_id']), null, 'DELETE')).is.true();
      });
    });
  });
});
