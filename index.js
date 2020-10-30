/** @type {(url: string, options?: RequestInit) => Promise<Response>} */
const fetch = require('node-fetch');
const { URL, URLSearchParams } = require('url');
const OperationException = require('./exceptions/operation-exception');
const QueryBuilder = require('./query-builder');
const utils = require('./utils');

/**
 * ServiceMeow - a Node.js API client for the ServiceNow REST API
 */
class ServiceMeow {
  /**
  * Initiates the ServiceNow Client
  *
  * @param {string} instance Instance URL
  * @param {string} username Username to login with
  * @param {string} password Password to login with
  * @param {Object} [opts] Additional options
  * @param {string} [opts.apiName='table'] ServiceNow API to call
  * @param {string} [opts.namespace='now'] ServiceNow namespace to target
  * @public
  */
  constructor(instance, username, password, { apiName = 'table', namespace = 'now' } = {}) {
    this.instance = instance;
    this.username = username;
    this.password = password;
    this.namespace = namespace;
    this.apiName = apiName;
    this.scriptName = 'Client';
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': Buffer.from(this.username + ':' + this.password).toString('base64')
    };
    this.baseUrl = utils.buildUrl(this.instance, this.namespace, this.apiName);
  }

  /**
  * @callback ResponseSelector
  * @param {Response} res Response object from fetch
  * @returns {any} Whatever data is needed from the response
  */
  /**
  * Make a request to ServiceNow
  *
  * @param {string|string[]} path Path to query
  * @param {Object} [query] Query string params object
  * @param {string} [method='GET'] HTTP method to use, defaults to GET
  * @param {Object} [body] Request body as object
  * @param {ResponseSelector} [responseSelector] Selector to choose what to return. If omitted, JSON promise is
  *   returned.
  * @returns {Promise<any>} Promise for response parsed JSON or whatever the ResponseSelector requests
  * @private
  */
  // eslint-disable-next-line max-params, max-statements
  async _request(path, query, method = 'GET', body, responseSelector) {
    path = Array.isArray(path) ? path : [path];
    const url = new URL(this.baseUrl + path.map(p => '/' + encodeURIComponent(p)).join(''));
    query && (url.search = new URLSearchParams(query).toString());
    let res;
    try {
      res = await fetch(url.toString(), {
        headers: this.headers,
        method,
        body: body && JSON.stringify(body)
      });
    } catch (err) {
      throw new OperationException(
        'Error while performing specified operation on ' + this.instance + '. Error: ' + err.toString(), err);
    }
    if (!res.ok) {
      throw new OperationException('Error while performing specified operation on ' + this.instance + '. Error code: '
      + res.status + ', error: ' + res.statusText);
    }
    if (responseSelector) return responseSelector(res);
    try {
      const json = await res.json();
      return json;
    } catch (err) {
      // No response body, or not JSON. Just return void.
      return;
    }
  }

  /**
  * @typedef {Object} QueryResult
  * @prop {Object[]} result Array of result items
  */
  /**
  * Get a set of records based on a query
  *
  * @param {string} table Table to query
  * @param {string|QueryBuilder} [query] Query to run, either as a string or a QueryBuilder instance
  * @returns {Promise<QueryResult>} Promise for the query result from ServiceNow
  * @public
  */
  async getRecords(table, query) {
    const qs = {};
    if (query instanceof QueryBuilder) {
      qs.sysparm_query = query.build();
    } else if (query) {
      qs.sysparm_query = query;
    }

    return this._request(table, qs);
  }

  /**
  * Get the count of records in a given query result
  *
  * @param {string} table Table to query
  * @param {string|QueryBuilder} [query] Query to run, either as a string or as a QueryBuilder instance
  * @returns {Promise<number>} Count of records for given query and table
  * @public
  */
  async getRecordCount(table, query) {
    const qs = {
      sysparm_fields: 'sys_created_on'
    };
    if (query instanceof QueryBuilder) {
      qs.sysparm_query = query.build();
    } else if (query) {
      qs.sysparm_query = query;
    }

    const response = await this._request(table, qs);
    return response && response.result && response.result.length || 0;
  }

  /**
  * Create a record
  *
  * @param {string} table Table to create a record in
  * @param {Object} body Record body
  * @returns {Promise<string>} sys_id
  * @public
  */
  async createRecord(table, body) {
    const response = await this._request(table, null, 'POST', body);
    return response.result.sys_id;
  }

  /**
  * Get a single record by ID
  *
  * @param {string} table Table to query
  * @param {string} sysId ID of the record to query for
  * @returns {Promise<Object>} Record that's found
  * @public
  */
  async getSingleRecord(table, sysId) {
    return this._request([table, sysId]);
  }

  /**
  * Update a single record by ID
  *
  * @param {string} table Table in which record exists
  * @param {Object} body Object of fields to update the ticket with
  * @param {string} sysId ID of the record to update
  * @returns {Promise<string>} sys_id ID of the updated record
  * @public
  */
  async updateSingleRecord(table, body, sysId) {
    const response = await this._request([table, sysId], null, 'PUT', body);
    return response.result.sys_id;
  }

  /**
  * Delete a single record by ID
  *
  * @param {string} table Table in which the record exists
  * @param {string} sysId ID of the record to delete
  * @returns {Promise<boolean>} Whether a record was deleted
  * @public
  */
  async deleteSingleRecord(table, sysId) {
    return this._request([table, sysId], null, 'DELETE', null, res => res.status === 204);
  }
}

ServiceMeow.QueryBuilder = QueryBuilder;
module.exports = ServiceMeow;
