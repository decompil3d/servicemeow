/**
 * Utility functions
 * @private
 */
module.exports = class Utils {
  /**
   * Build the relative URL to the ServiceNow API
   *
   * @param {...string} args The path segments to append to the URL
   * @returns {string} The relative URL to the specified API endpoint
   */
  static buildUrl(...args) {
    args.splice(1, 0, 'api');
    return args.join('/');
  }
};
