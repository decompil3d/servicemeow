![CI](https://github.com/decompil3d/servicemeow/workflows/CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/decompil3d/servicemeow/badge.svg?branch=main)](https://coveralls.io/github/decompil3d/servicemeow?branch=main)

# ServiceMeow

A Node.js client for the ServiceNOW REST API.

## Installation

Run `npm install servicemeow` to install the package.

## Basic Usage

```
const ServiceMeow = require('servicemeow');

const sm = new ServiceMeow('https://<INSTANCE>.service-now.com','<USERNAME>','<PASSWORD>');

const record = await sm.getSingleRecord('<TABLE_NAME>', <SYS_ID>);
```

## Supported Actions

```js
// returns JSON of record
getSingleRecord('<TABLE_NAME>', '<SYS_ID>');

// returns sys_id of created record
createRecord('<TABLE_NAME>', { /* <JSON_RECORD_BODY> */ });

// returns true if success, false otherwise
deleteSingleRecord('<TABLE_NAME>', '<SYS_ID_OF_RECORD_TO_BE_DELETED>');

// returns sys_id of updated record
updateSingleRecord('<TABLE_NAME>', { /* <JSON_RECORD_BODY> */ }, '<SYS_ID_OF_RECORD_TO_BE_DELETED>');

// Returns JSON of list of record(s). Use query builder for building advanced serviceNOW  encoded query
getRecords('<TABLE_NAME>', '<ENCODED_QUERY>');

// returns count of records matching given query
getRecordCount('<TABLE_NAME>', '<ENCODED_QUERY>');
```

## Example Usage of Above Actions

```js
const record = await sm.getSingleRecord('<TABLE_NAME>', '<SYS_ID>');

const id = await sm.createRecord('<TABLE_NAME>', {'endpoint': 'published'});

const deleted = await sm.deleteSingleRecord('<TABLE_NAME>', '<SYS_ID>');

const id = await servicenowClient.updateSingleRecord('<TABLE_NAME>', { /* <JSON_RECORD_BODY> */ }, '<SYS_ID>');

// Consider using QueryBuilder to create encoded queries
const records = await servicenowClient.getRecords('<TABLE_NAME>', '<ENCODED_QUERY>');

const count = await sm.getRecordCount('<TABLE_NAME>', '<ENCODED_QUERY>');
```

## Query Builder Example Usage

```js
const { QueryBuilder } = require('servicemeow');
const queryBuilder = new QueryBuilder();

// Less than '<'
const query = queryBuilder.field('sys_created_on').lessThan('2019-02-15 14:30:18');

// Less than using Date object
const query = queryBuilder.field('sys_created_on').lessThan(new Date());

// Greater than using Date object
const query = queryBuilder.field('sys_created_on').lessThan(new Date());


// compound query using and, lessThan, greaterThan
const query = queryBuilder.field('number').greaterThan('S').and().field('sys_created_on').lessThan(new Date());

// Between two dates, numbers, Strings 
const query = queryBuilder.field('sys_created_on').between('2015-02-15 14:30:18', '2019-02-18 14:30:18');
const query = queryBuilder.field('risk_score').between(47, 52);
const query = queryBuilder.field('number').between('A', 'Z');

// Empty String query
const query = queryBuilder.field('description').isEmptyString();

// Example of 'IN' operator
const query = queryBuilder.field('number').isOneOf(['INC0010122','INC0010120']);

// Is anything operator
const query = queryBuilder.field('number').isAnything();

// Contains operator
const query = queryBuilder.field('number').contains('<YOUR_STRING>');

// Order ascending/descending
const query = queryBuilder.field('number').contains('<YOUR_STRING>').or().contains('<OTHER_STRING>').orderAscending();

// Multiple conditions on a single field
const query = queryBuilder.field('number').contains('<YOUR_STRING>').and().contains('<OTHER_STRING>').orderDescending();

// Ends with operator
const query = queryBuilder.field('number').endsWith('<YOUR_STRING>');

// Does not contain
const query = queryBuilder.field('number').doesNotContain('<YOUR_STRING>');

// equals
const query = queryBuilder.field('number').equals('<YOUR_STRING>/<ARRAY>');

// isEmpty
const query = queryBuilder.field('number').isEmpty();

// isNotEmpty
const query = queryBuilder.field('number').isNotEmpty();
```

## Acknowledgements

ServiceMeow was forked from [`ServiceNOW-Client`](https://github.com/Kaushal28/ServiceNOW-Client) by
[Kaushal Shah](https://github.com/Kaushal28).
