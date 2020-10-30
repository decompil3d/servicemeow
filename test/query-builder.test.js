/* eslint max-statements:0 */

const assume = require('assume');
const { describe, it, beforeEach } = require('mocha');

const QueryBuilder = require('../query-builder');
const QueryEmptyException = require('../exceptions/query-empty-exception');
const QueryMissingFieldException = require('../exceptions/query-missing-field-exception');
const QueryTypeException = require('../exceptions/query-type-exception');

describe('QueryBuilder', function () {
  /** @type {QueryBuilder} */
  let q;
  beforeEach(function () {
    q = new QueryBuilder();
  });

  describe('field', function () {
    it('is a function', function () {
      assume(q.field).is.a('function');
      assume(q.field).has.length(1);
    });
  });

  describe('orderDescending', function () {
    it('is a function', function () {
      assume(q.orderDescending).is.a('function');
      assume(q.orderDescending).has.length(0);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').orderDescending().build();
      assume(res).equals('ORDERBYDESCfoo');
    });
  });

  describe('orderAscending', function () {
    it('is a function', function () {
      assume(q.orderAscending).is.a('function');
      assume(q.orderAscending).has.length(0);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').orderAscending().build();
      assume(res).equals('ORDERBYfoo');
    });
  });

  describe('startsWith', function () {
    it('is a function', function () {
      assume(q.startsWith).is.a('function');
      assume(q.startsWith).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.startsWith('foo')).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').startsWith('bar').build();
      assume(res).equals('fooSTARTSWITHbar');
    });
  });

  describe('endsWith', function () {
    it('is a function', function () {
      assume(q.endsWith).is.a('function');
      assume(q.endsWith).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.endsWith('foo')).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').endsWith('bar').build();
      assume(res).equals('fooENDSWITHbar');
    });
  });

  describe('contains', function () {
    it('is a function', function () {
      assume(q.contains).is.a('function');
      assume(q.contains).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.contains('foo')).throws(QueryMissingFieldException);
    });

    it('throws when a non-string type is passed', function () {
      // @ts-expect-error
      assume(() => q.field('foo').contains(0)).throws(QueryTypeException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').contains('bar').build();
      assume(res).equals('fooLIKEbar');
    });
  });

  describe('doesNotContain', function () {
    it('is a function', function () {
      assume(q.doesNotContain).is.a('function');
      assume(q.doesNotContain).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.doesNotContain('foo')).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').doesNotContain('bar').build();
      assume(res).equals('fooNOTLIKEbar');
    });
  });

  describe('isEmpty', function () {
    it('is a function', function () {
      assume(q.isEmpty).is.a('function');
      assume(q.isEmpty).has.length(0);
    });

    it('throws when no field is set', function () {
      assume(() => q.isEmpty()).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').isEmpty().build();
      assume(res).equals('fooISEMPTY');
    });
  });

  describe('isNotEmpty', function () {
    it('is a function', function () {
      assume(q.isNotEmpty).is.a('function');
      assume(q.isNotEmpty).has.length(0);
    });

    it('throws when no field is set', function () {
      assume(() => q.isNotEmpty()).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').isNotEmpty().build();
      assume(res).equals('fooISNOTEMPTY');
    });
  });

  describe('equals', function () {
    it('is a function', function () {
      assume(q.equals).is.a('function');
      assume(q.equals).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.equals('foo')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').equals(false)).throws(QueryTypeException);
    });

    it('constructs query properly for a string', function () {
      const res = q.field('foo').equals('bar').build();
      assume(res).equals('foo=bar');
    });

    it('constructs query properly for a number', function () {
      const res = q.field('foo').equals(0).build();
      assume(res).equals('foo=0');
    });

    it('constructs query properly for an array', function () {
      const res = q.field('foo').equals(['bar', 'baz']).build();
      assume(res).equals('fooINbar,baz');
    });
  });

  describe('notEquals', function () {
    it('is a function', function () {
      assume(q.notEquals).is.a('function');
      assume(q.notEquals).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.notEquals('foo')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').notEquals(false)).throws(QueryTypeException);
    });

    it('constructs query properly for a string', function () {
      const res = q.field('foo').notEquals('bar').build();
      assume(res).equals('foo!=bar');
    });

    it('constructs query properly for a number', function () {
      const res = q.field('foo').notEquals(0).build();
      assume(res).equals('foo!=0');
    });

    it('constructs query properly for an array', function () {
      const res = q.field('foo').notEquals(['bar', 'baz']).build();
      assume(res).equals('fooNOT INbar,baz');
    });
  });

  describe('greaterThan', function () {
    it('is a function', function () {
      assume(q.greaterThan).is.a('function');
      assume(q.greaterThan).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.greaterThan('foo')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').greaterThan(false)).throws(QueryTypeException);
    });

    it('constructs query properly for a string', function () {
      const res = q.field('foo').greaterThan('bar').build();
      assume(res).equals('foo>bar');
    });

    it('constructs query properly for a number', function () {
      const res = q.field('foo').greaterThan(0).build();
      assume(res).equals('foo>0');
    });

    it('constructs query properly for a Date', function () {
      const res = q.field('foo').greaterThan(new Date('2020-01-01T12:12:12Z')).build();
      assume(res).equals('foo>2020-01-01 12:12:12');
    });
  });

  describe('greaterThanOrIs', function () {
    it('is a function', function () {
      assume(q.greaterThanOrIs).is.a('function');
      assume(q.greaterThanOrIs).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.greaterThanOrIs('foo')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').greaterThanOrIs(false)).throws(QueryTypeException);
    });

    it('constructs query properly for a string', function () {
      const res = q.field('foo').greaterThanOrIs('bar').build();
      assume(res).equals('foo>=bar');
    });

    it('constructs query properly for a number', function () {
      const res = q.field('foo').greaterThanOrIs(0).build();
      assume(res).equals('foo>=0');
    });

    it('constructs query properly for a Date', function () {
      const res = q.field('foo').greaterThanOrIs(new Date('2020-01-01T12:12:12Z')).build();
      assume(res).equals('foo>=2020-01-01 12:12:12');
    });
  });

  describe('lessThan', function () {
    it('is a function', function () {
      assume(q.lessThan).is.a('function');
      assume(q.lessThan).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.lessThan('foo')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').lessThan(false)).throws(QueryTypeException);
    });

    it('constructs query properly for a string', function () {
      const res = q.field('foo').lessThan('bar').build();
      assume(res).equals('foo<bar');
    });

    it('constructs query properly for a number', function () {
      const res = q.field('foo').lessThan(0).build();
      assume(res).equals('foo<0');
    });

    it('constructs query properly for a Date', function () {
      const res = q.field('foo').lessThan(new Date('2020-01-01T12:12:12Z')).build();
      assume(res).equals('foo<2020-01-01 12:12:12');
    });
  });

  describe('lessThanOrIs', function () {
    it('is a function', function () {
      assume(q.lessThanOrIs).is.a('function');
      assume(q.lessThanOrIs).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.lessThanOrIs('foo')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').lessThanOrIs(false)).throws(QueryTypeException);
    });

    it('constructs query properly for a string', function () {
      const res = q.field('foo').lessThanOrIs('bar').build();
      assume(res).equals('foo<=bar');
    });

    it('constructs query properly for a number', function () {
      const res = q.field('foo').lessThanOrIs(0).build();
      assume(res).equals('foo<=0');
    });

    it('constructs query properly for a Date', function () {
      const res = q.field('foo').lessThanOrIs(new Date('2020-01-01T12:12:12Z')).build();
      assume(res).equals('foo<=2020-01-01 12:12:12');
    });
  });

  describe('between', function () {
    it('is a function', function () {
      assume(q.between).is.a('function');
      assume(q.between).has.length(2);
    });

    it('throws when no field is set', function () {
      assume(() => q.between('foo', 'bar')).throws(QueryMissingFieldException);
    });

    it('throws for an invalid data type', function () {
      // @ts-expect-error
      assume(() => q.field('foo').between(false, true)).throws(QueryTypeException);
    });

    it('throws for inconsistent data types', function () {
      // @ts-expect-error
      assume(() => q.field('foo').between('foo', 0)).throws(QueryTypeException);
    });

    it('constructs query properly for strings', function () {
      const res = q.field('foo').between('bar', 'baz').build();
      assume(res).equals('fooBETWEENbar@baz');
    });

    it('constructs query properly for numbers', function () {
      const res = q.field('foo').between(0, 9).build();
      assume(res).equals('fooBETWEEN0@9');
    });

    it('constructs query properly for Dates', function () {
      const res = q.field('foo').between(new Date('2020-01-01T12:12:12Z'), new Date('2020-12-31T12:12:12Z')).build();
      assume(res).equals('fooBETWEEN2020-01-01 12:12:12@2020-12-31 12:12:12');
    });
  });

  describe('isAnything', function () {
    it('is a function', function () {
      assume(q.isAnything).is.a('function');
      assume(q.isAnything).has.length(0);
    });

    it('throws when no field is set', function () {
      assume(() => q.isAnything()).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').isAnything().build();
      assume(res).equals('fooANYTHING');
    });
  });

  describe('isOneOf', function () {
    it('is a function', function () {
      assume(q.isOneOf).is.a('function');
      assume(q.isOneOf).has.length(1);
    });

    it('throws when no field is set', function () {
      assume(() => q.isOneOf(['foo'])).throws(QueryMissingFieldException);
    });

    it('throws when a non-array is passed', function () {
      // @ts-expect-error
      assume(() => q.isOneOf(1)).throws(QueryTypeException);
    });

    it('throws when an array of the wrong type is passed', function () {
      // @ts-expect-error
      assume(() => q.field('foo').isOneOf([true, true])).throws(QueryTypeException);
    });

    it('constructs query properly for strings', function () {
      const res = q.field('foo').isOneOf(['bar', 'baz']).build();
      assume(res).equals('fooINbar,baz');
    });

    it('constructs query properly for numbers', function () {
      const res = q.field('foo').isOneOf([1, 2]).build();
      assume(res).equals('fooIN1,2');
    });
  });

  describe('isEmptyString', function () {
    it('is a function', function () {
      assume(q.isEmptyString).is.a('function');
      assume(q.isEmptyString).has.length(0);
    });

    it('throws when no field is set', function () {
      assume(() => q.isEmptyString()).throws(QueryMissingFieldException);
    });

    it('constructs query properly', function () {
      const res = q.field('foo').isEmptyString().build();
      assume(res).equals('fooEMPTYSTRING');
    });
  });

  describe('and', function () {
    it('is a function', function () {
      assume(q.and).is.a('function');
      assume(q.and).has.length(0);
    });

    it('constructs query properly', function () {
      const res = q.and().build();
      assume(res).equals('^');
    });
  });

  describe('or', function () {
    it('is a function', function () {
      assume(q.or).is.a('function');
      assume(q.or).has.length(0);
    });

    it('constructs query properly', function () {
      const res = q.or().build();
      assume(res).equals('^OR');
    });
  });

  describe('nq', function () {
    it('is a function', function () {
      assume(q.nq).is.a('function');
      assume(q.nq).has.length(0);
    });

    it('constructs query properly', function () {
      const res = q.nq().build();
      assume(res).equals('^NQ');
    });
  });

  describe('build', function () {
    it('throws on empty query', function () {
      assume(() => q.build()).throws(QueryEmptyException);
    });
  });
});
