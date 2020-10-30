/**
 * An exception type for when an empty query is attempted to be built in a @see {QueryBuilder}
 */
module.exports = class QueryEmptyException extends Error {
  /**
   * Construct a QueryEmptyException
   *
   * @param {string} message The error message
   */
  constructor(message) {
    super(message);
    this.name = 'QueryEmptyException';
  }
};
