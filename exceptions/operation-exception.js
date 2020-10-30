/**
 * An exception type for errors encountered while interacting with the ServiceNow API
 */
module.exports = class OperationException extends Error {
  /**
   * Construct a QueryEmptyException
   *
   * @param {string} message The error message
   * @param {Error} [innerError] An underlying error that triggered this exception
   */
  constructor(message, innerError) {
    super(message);
    this.name = 'OperationException';
    this.innerError = innerError;
  }
};
