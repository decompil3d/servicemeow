const QueryMissingFieldException = require('./exceptions/query-missing-field-exception');
const QueryTypeException = require('./exceptions/query-type-exception');
const QueryEmptyException = require('./exceptions/query-empty-exception');

/**
 * @typedef {'year'|'month'|'week'|'day'|'hour'} RelativeToField
 */

/**
 * @private
 */
class RelativeDateBuilder {
  /**
   * @param {QueryBuilder} parent Parent builder
   * @param {string} quantifier Relationship between base and n
   * @param {number} n Number of unit
   * @param {RelativeToField} unit Unit of time
   */
  constructor(parent, quantifier, n, unit) {
    this.parent = parent;
    this.quantifier = quantifier.toLocaleUpperCase();
    this.n = n;
    this.unit = unit;
  }

  /**
   * Complete the condition and return control to the parent QueryBuilder.
   * @param {string} field to compare against current field
   * @returns {QueryBuilder} parent
   */
  before(field) {
    this.parent._addCondition(`${this.quantifier}THAN`, `${field}@${this.unit}@before@${this.n}`, ['string']);
    return this.parent;
  }
}

/**
* QueryBuilder: For constructing advanced ServiceNow queries
*/
class QueryBuilder {

  constructor() {
    this.query = [];
    this.currentField = '';
  }

  /**
  * Sets the field to operate on
  *
  * @param {string} fieldName Field name to operate on
  * @returns {this} this
  */
  field(fieldName) {
    this.currentField = fieldName;
    return this;
  }

  /**
  * Sets ordering of field to descending
  * @returns {this} this
  */
  orderDescending() {
    this.query.push('ORDERBYDESC' + this.currentField);
    return this;
  }

  /**
  * Sets ordering of field to ascending
  * @returns {this} this
  */
  orderAscending() {
    this.query.push('ORDERBY' + this.currentField);
    return this;
  }

  /**
  * Adds new STARTSWITH condition
  *
  * @param {string} startsWithStr Substring to check
  * @returns {this} this
  */
  startsWith(startsWithStr) {
    return this._addCondition('STARTSWITH', startsWithStr, ['string']);
  }

  /**
  * Adds new ENDSWITH condition
  *
  * @param {String} endsWithStr Substring to check
  * @returns {this} this
  */
  endsWith(endsWithStr) {
    return this._addCondition('ENDSWITH', endsWithStr, ['string']);
  }

  /**
  * Adds new LIKE condition
  *
  * @param {String} containsStr Substring to check
  * @returns {this} this
  */
  contains(containsStr) {
    return this._addCondition('LIKE', containsStr, ['string']);
  }

  /**
  * Adds new NOTLIKE condition
  *
  * @param {String} notContainsStr Substring to check
  * @returns {this} this
  */
  doesNotContain(notContainsStr) {
    return this._addCondition('NOTLIKE', notContainsStr, ['string']);
  }

  /**
  * Adds new ISEMPTY condition
  * @returns {this} this
  */
  isEmpty() {
    return this._addCondition('ISEMPTY', '', ['string']);
  }

  /**
  * Adds new ISNOTEMPTY condition
  * @returns {this} this
  */
  isNotEmpty() {
    return this._addCondition('ISNOTEMPTY', '', ['string']);
  }

  /**
  * Adds new equality condition
  *
  * @param {string|number|string[]|number[]} data Value to check equality to
  * @returns {this} this
  * @throws {QueryTypeException}
  */
  equals(data) {
    if (typeof data === 'string' || typeof data === 'number') {
      return this._addCondition('=', data, ['string', 'number']);
    } else if (Array.isArray(data)) {
      return this._addCondition('IN', data, ['string', 'number']);
    }

    throw new QueryTypeException('Expected string or list type, found: ' + typeof data);
  }

  /**
  * Adds new non equality condition
  *
  * @param {string|number|string[]|number[]} data Value to check inequality to
  * @returns {this} this
  * @throws {QueryTypeException}
  */
  notEquals(data) {
    if (typeof data === 'string' || typeof data === 'number') {
      return this._addCondition('!=', data, ['string', 'number']);
    } else if (Array.isArray(data)) {
      return this._addCondition('NOT IN', data, ['string', 'number']);
    }

    throw new QueryTypeException('Expected string or list type, found: ' + typeof data);
  }

  /**
  * Adds new '>' condition
  *
  * @param {string|number|Date} greaterThanValue Value to compare against
  * @returns {this} this
  */
  greaterThan(greaterThanValue) {
    return this._addComparisonCondition(greaterThanValue, '>');
  }

  /**
  * Adds new '>=' condition
  *
  * @param {string|number|Date} greaterThanOrIsValue Value to compare against
  * @returns {this} this
  */
  greaterThanOrIs(greaterThanOrIsValue) {
    return this._addComparisonCondition(greaterThanOrIsValue, '>=');
  }

  /**
  * Adds new '<' condition
  *
  * @param {string|number|Date} lessThanValue Value to compare against
  * @returns {this} this
  */
  lessThan(lessThanValue) {
    return this._addComparisonCondition(lessThanValue, '<');
  }

  /**
  * Adds new '<=' condition
  *
  * @param {string|number|Date} lessThanOrIsValue Value to compare against
  * @returns {this} this
  */
  lessThanOrIs(lessThanOrIsValue) {
    return this._addComparisonCondition(lessThanOrIsValue, '<=');
  }

  /**
  * Adds new 'BETWEEN' condition
  *
  * @param {T} startValue Start value to compare against
  * @param {T} endValue End value to compare against
  * @template {string|number|Date} T
  * @returns {this} this
  * @throws {QueryTypeException}
  */
  between(startValue, endValue) {
    let betweenOperand = '';
    if ((typeof startValue === 'number' && typeof endValue === 'number')
    || (typeof startValue === 'string' && typeof endValue === 'string')) {

      betweenOperand = `${startValue}@${endValue}`;
    } else if ((startValue instanceof Date)
    && (endValue instanceof Date)) {

      betweenOperand = `${this._getDateTimeInUTC(startValue)}@${this._getDateTimeInUTC(endValue)}`;
    } else {
      throw new QueryTypeException('Expected string/date/number type, found: startValue:'
      + typeof startValue + ', endValue:'
      + typeof endValue);
    }

    return this._addCondition('BETWEEN', betweenOperand, ['string']);
  }

  /**
  * Adds new 'ANYTHING' condition
  * @returns {this} this
  */
  isAnything() {
    return this._addCondition('ANYTHING', '', ['string']);
  }

  /**
  * Adds new 'IN' condition
  *
  * @param {string[]|number[]} data Array of strings to compare against
  * @returns {this} this
  * @throws {QueryTypeException}
  */
  isOneOf(data) {
    if (Array.isArray(data)) {
      return this._addCondition('IN', data, ['string', 'number']);
    }
    throw new QueryTypeException('Expected array type, found: ' + typeof data);
  }

  /**
  * Adds new 'NOT IN' condition
  *
  * @param {string[]|number[]} data Array of strings to compare against
  * @returns {this} this
  * @throws {QueryTypeException}
  */
  isNoneOf(data) {
    if (Array.isArray(data)) {
      return this._addCondition('NOT IN', data, ['string', 'number']);
    }
    throw new QueryTypeException('Expected array type, found: ' + typeof data);
  }

  /**
  * Adds new 'EMPTYSTRING' condition
  * @returns {this} this
  */
  isEmptyString() {
    return this._addCondition('EMPTYSTRING', '', ['string']);
  }

  /**
   * Adds new 'SAMEAS' condition
   * @param {string} field string name of compared field
   * @returns {this} this
   */
  isSameAs(field) {
    return this._addCondition('SAMEAS', field, ['string']);
  }

  /**
   * Adds new 'NSAMEAS' condition
   * @param {string} field string name of compared field
   * @returns {this} this
   */
  isNotSameAs(field) {
    return this._addCondition('NSAMEAS', field, ['string']);
  }

  /**
   * Adds new 'GT_FIELD' condition
   *
   * @param {string} field name of field to compare against
   * @returns {this} this
   */
  greaterThanField(field) {
    return this._addComparisonCondition(field, 'GT_FIELD');
  }

  /**
   * Adds new 'GT_OR_EQUALS_FIELD' condition
   *
   * @param {string} field name of field to compare against
   * @returns {this} this
   */
  greaterThanOrEqualToField(field) {
    return this._addComparisonCondition(field, 'GT_OR_EQUALS_FIELD');
  }

  /**
   * Adds new 'LT_FIELD' condition
   *
   * @param {string} field name of field to compare against
   * @returns {this} this
   */
  lessThanField(field) {
    return this._addComparisonCondition(field, 'LT_FIELD');
  }

  /**
   * Adds new 'LT_OR_EQUALS_FIELD' condition
   *
   * @param {string} field name of field to compare against
   * @returns {this} this
   */
  lessThanOrEqualToField(field) {
    return this._addComparisonCondition(field, 'LT_OR_EQUALS_FIELD');
  }

  /**
   * @typedef {'year'|'month'|'hour'|'minute'} RelativeToNow
   */

  /**
   * Adds new 'RELATIVEGT' condition
   * @param {number} n number of unit
   * @param {RelativeToNow} unit of time (year, month, hour, minute)
   * @returns {this} this
   */
  since(n, unit) {
    if (!(typeof n === 'number' && typeof unit === 'string')) {
      throw new QueryTypeException(`Expected (number, string); got (${typeof n}, ${typeof unit})`);
    }
    return this._addCondition('RELATIVEGT', `@${unit}@ago@${n}`, ['string']);
  }

  /**
   * Adds new 'RELATIVELT' condition
   * @param {number} n number of unit
   * @param {RelativeToNow} unit of time (year, month, hour, minute)
   * @returns {this} this
  */
  notSince(n, unit) {
    if (!(typeof n === 'number' && typeof unit === 'string')) {
      throw new QueryTypeException(`Expected (number, string); got (${typeof n}, ${typeof unit})`);
    }
    return this._addCondition('RELATIVELT', `@${unit}@ago@${n}`, ['string']);
  }

  /**
   * Adds new two-step fluent 'MORETHAN' condition
   * @param {number} n number of unit
   * @param {RelativeToField} unit of time (year, month, week, day, hour)
   * @returns {RelativeDateBuilder} builder object supporting .before(field) -> original builder
  */
  isMoreThan(n, unit) {
    if (!(typeof n === 'number' && typeof unit === 'string')) {
      throw new QueryTypeException(`Expected (number, string); got (${typeof n}, ${typeof unit})`);
    }
    return new RelativeDateBuilder(this, 'MORE', n, unit);
  }

  /**
   * Adds new two-step fluent 'LESSTHAN' condition
   * @param {number} n number of unit
   * @param {RelativeToField} unit of time (year, month, week, day, hour)
   * @returns {RelativeDateBuilder} builder object supporting .before(field) -> original builder
   */
  isLessThan(n, unit) {
    if (!(typeof n === 'number' && typeof unit === 'string')) {
      throw new QueryTypeException(`Expected (number, string); got (${typeof n}, ${typeof unit})`);
    }
    return new RelativeDateBuilder(this, 'LESS', n, unit);
  }

  /**
  * Adds AND operator
  * @returns {this} this
  */
  and() {
    return this._addLogicalOperator('^');
  }

  /**
  * Adds OR operator
  * @returns {this} this
  */
  or() {
    return this._addLogicalOperator('^OR');
  }

  /**
  * Adds new NQ operator
  * @returns {this} this
  */
  nq() {
    return this._addLogicalOperator('^NQ');
  }

  /**
  * Adds logical operator to current query string
  *
  * @param {string} operator Operator to add
  * @returns {this} this
  * @private
  */
  _addLogicalOperator(operator) {
    this.query.push(operator);
    return this;
  }

  /**
  * Adds new condition to current query string
  *
  * @param {string} operator Operator for condition
  * @param {string|number|string[]|number[]} operand Operand for condition
  * @param {string[]} types Supported types
  * @returns {this} this
  * @private
  */
  _addCondition(operator, operand, types) {
    if (!this.currentField) {
      throw new QueryMissingFieldException('Conditions requires a field.');
    }

    if (Array.isArray(operand)) {
      operand.forEach(v => this._validateType(v, types));
      operand = operand.join(',');
    } else {
      this._validateType(operand, types);
    }

    this.query.push(this.currentField + operator + operand);
    return this;
  }

  /**
  * Validate that the value is of one of the specified types or an array of the same
  *
  * @param {any} val Value to validate
  * @param {string[]} types Type names supported
  * @throws {QueryTypeException} Throws if value is not a supported type
  * @private
  */
  _validateType(val, types) {
    if (!types.includes(typeof val)) {
      let errorMessage = '';
      if (types.length > 1) {
        errorMessage = 'Invalid type passed. Expected one of: ' + types;
      } else {
        errorMessage = 'Invalid type passed. Expected: ' + types;
      }
      throw new QueryTypeException(errorMessage);
    }
  }

  /**
  * Builds ServiceNow readable query
  *
  * @returns {string} Prepared ServiceNow query
  * @throws {QueryEmptyException}
  */
  build() {
    if (this.query.length === 0) {
      throw new QueryEmptyException('At least one condition is required in query.');
    }
    return this.query.join('');
  }

  /**
  * Converts date/moment object to UTC and formats to ServiceNOW readable date string.
  *
  * @param {Date} dateTime Date object to convert
  * @returns {string} formatted Date-Time string
  * @private
  */
  _getDateTimeInUTC(dateTime) {
    // 2020-01-01T12:12:12.000Z -> 2020-01-01 12:12:12
    return dateTime.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
  }

  /**
  * Adds comparison conditions {'>', '<', '>=', '<='}
  *
  * @param {string|number|string|Date} valueToCompare Value to compare against
  * @param {string} operator Operator with which to compare
  * @returns {this} this
  * @throws {QueryTypeException}
  */
  _addComparisonCondition(valueToCompare, operator) {
    if (valueToCompare instanceof Date) {
      valueToCompare = this._getDateTimeInUTC(valueToCompare);
    } else if (!(typeof valueToCompare === 'number' || typeof valueToCompare === 'string')) {
      throw new QueryTypeException('Expected string/Date/number type, found: ' + typeof valueToCompare);
    }
    return this._addCondition(operator, valueToCompare, ['number', 'string']);
  }
}

module.exports = QueryBuilder;
