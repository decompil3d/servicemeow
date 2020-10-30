/**
 * An exception type thrown when attempting to apply operations on a @see {QueryBuilder} with invalid typed operand(s)
 */
module.exports = class QueryTypeException extends Error {
  /**
   * Construct a QueryTypeException
   *
   * @param {string} message The error message
   */
  constructor(message) {
    super(message);
    this.name = 'QueryTypeException';
  }
};
