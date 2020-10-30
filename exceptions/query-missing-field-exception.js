/**
 * An exception type thrown when attempting to add operations onto a @see {QueryBuilder} that does not have a field
 * chosen
 */
module.exports = class QueryMissingFieldException extends Error {
  /**
   * Construct a QueryMissingFieldException
   *
   * @param {string} message The error message
   */
  constructor(message) {
    super(message);
    this.name = 'QueryMissingFieldException';
  }
};
