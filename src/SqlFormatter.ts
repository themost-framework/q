// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

import { Args } from '@themost/common';
import { SqlUtils } from './SqlUtils';
import { getOwnPropertyName, isMethodOrNameReference, PropertyIndexer } from './query';
import { QueryCollection } from './QueryCollection';
import { QueryExpression } from './QueryExpression';
import { hasOwnProperty } from './has-own-property';
import { ObjectNameValidator } from './ObjectNameValidator';
import { instanceOf } from './instance-of';

class ExpectedWhereExpression extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super();
        this.message = msg || 'Current expression requires a valid where statement.';
    }
}

class ExpectedSelectExpression extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super();
        this.message = msg || 'Invalid query expression. Expected a valid select expression.'
    }
}

class ExpectedInsertExpression extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super();
        this.message = msg || 'Invalid query expression. Expected a valid insert expression.'
    }
}

class ExpectedUpdateExpression extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super();
        this.message = msg || 'Invalid query expression. Expected a valid update expression.';
    }
}

class ExpectedDeleteExpression extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super();
        this.message = msg || 'Invalid query expression. Expected a valid delete expression.';
    }
}

class ExpectedCollection extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super();
        this.message = msg || 'Invalid query expression. Expected a target collection expression.';
    }
}

class SqlFormatter {
    public settings: any;
    currectCollection: any;
    constructor() {
        this.settings = {
            nameFormat: '`$1`',
            forceAlias: false,
            useAliasKeyword: true,
            aliasKeyword: 'AS'
        }
    }

    escape(value: any, unquoted?: boolean): string {
        if (value == null)
            return SqlUtils.escape(null);
        const thisIndexer: PropertyIndexer = this;
        if (typeof value === 'object') {
            // add an exception for Date object
            if (value instanceof Date) {
                return SqlUtils.escape(value);
            }
            // parse literal values e.g. { $literal: 99.5 }
            if (hasOwnProperty(value, '$literal')) {
                if (typeof value.$literal === 'object') {
                    // get literal property
                    const literalProperty = getOwnPropertyName(value.$literal);
                    // if literal is an expression e.g. { $add: [ 100, 45 ] }
                    if (literalProperty && isMethodOrNameReference(literalProperty)) {
                        // if expression is a formatter method e.g. $add
                        if (typeof thisIndexer[literalProperty] === 'function') {
                            // call formatter method
                            return thisIndexer[literalProperty].apply(this, value.$literal);
                        }
                    }
                }
                return SqlUtils.escape(value.$literal);
            }
            if (hasOwnProperty(value, '$name')) {
                return this.escapeName(value.$name);
            }
            else {
                // check if value is a known expression e.g. { $length: "name" }
                const key = getOwnPropertyName(value);
                if ((typeof key === 'string') && /^\$/.test(key) && (typeof thisIndexer[key] === 'function')) {
                    const formatFunc = thisIndexer[key];
                    if (Array.isArray(value[key])) {
                        return formatFunc.apply(this, value[key]);
                    }
                    return formatFunc.call(this, value[key]);
                }
            }
        }
        if (typeof value === 'string' && /^\$/.test(value)) {
            return this.escapeName(value);
        }
        if (unquoted)
            return value.valueOf();
        else
            return SqlUtils.escape(value);
    }

    /**
     * @param {string} name
     */
    escapeCollection(name: string): string {
        Args.notString(name, 'Name');
        // return formatted name e.g User.name to `User`.`name`
        return name.replace(/\$?(\w+)|^\$?(\w+)$/g, this.settings.nameFormat);
    }

    /**
     * @param {string} name
     */
    escapeName(name: string): string {
        Args.notString(name, 'Name');
        let finalName;
        if (this.currectCollection && (/\./g.test(name) === false)) {
            finalName = this.currectCollection.concat('.', name);
        }
        else {
            finalName = name;
        }
        // return formatted name e.g User.name to `User`.`name`
        const validateName = finalName.replace(/\$?(\w+)|^\$?(\w+)$/g, '$1');
        return ObjectNameValidator.validator.escape(validateName, this.settings.nameFormat);
    }

    /**
     * @param {string} name
     */
    escapeNameOnly(name: string): string {
        let currentCollection;
        try {
            currentCollection = this.currectCollection;
            this.currectCollection = null;
            const result = this.escapeName(name);
            this.currectCollection = currentCollection;
            return result;
        }
        catch(err) {
            this.currectCollection = currentCollection;
            throw err;
        }
    }

    formatSelect(query: any): string {
        Args.notNull(query, 'Query expression');
        Args.check(query.$select != null, new Error('Format select requires a valid select expression'));
        // get select fields
        const selectFields = Object.keys(query.$select);
        // get select collection
        Args.check(query.$collection != null, new Error('Format select requires a valid collection'));
        const selectCollection = Object.assign(new QueryCollection(), query.$collection);
        let result = `SELECT`;
        if (query.$distinct) {
            result += ` DISTINCT`;
        }
        const escapedCollection = this.escapeCollection(selectCollection.name);
        // set current Collection
        this.currectCollection = null;
        if (this.settings.forceAlias) {
            // set current collection equal to collection alias or name
            this.currectCollection = selectCollection.alias || selectCollection.name;
        }
        if (selectCollection.alias) {
            this.currectCollection = selectCollection.alias;
        }
        // if select statement does not have any field use wildcard
        if (selectFields.length === 0) {
            // if formatter uses forceAlias e.g. `Users`.* instead of a single *
            if (this.settings.forceAlias) {
                result += ` ${this.escapeName('*')} FROM ${escapedCollection}`;
            }
            else {
                // append simple select e.g. * FROM `UserData`
                result += ` * FROM ${escapedCollection}`;
            }
        }
        else {
            result += ' ';
            result += selectFields.map( key => {
                const field: PropertyIndexer = { };
                field[key] = query.$select[key];
                return this.formatField(field);
            }).join(', ');
            // append simple select e.g. * FROM `UserData`
            result += ` FROM ${escapedCollection}`;
        }

        if (selectCollection.alias) {
            // append collection alias e.g. AS `Users`
            result += ` ${this.settings.aliasKeyword} ${this.escapeCollection(selectCollection.alias)}`
        }

        // format lookups
        if (query.$expand && query.$expand.length) {
            query.$expand.forEach((expand: any) => {
                result += ' ' + this.formatLookup(expand.$lookup, expand.$direction);
            });
        }

        if (query.$match != null) {
            if (query.$prepared == null) {
                result += ' WHERE ' + this.formatWhere(query.$match);
            }
            else {
                result += ' WHERE ' + this.formatWhere({
                    $and: [
                        query.$prepared,
                        query.$match
                    ]
                });
            }
        }

        if (query.$group != null) {
            result += ' GROUP BY ' + this.formatGroupBy(query.$group);
        }

        if (query.$order != null) {
            result += ' ORDER BY ' + this.formatOrder(query.$order);
        }
        this.currectCollection = null;
        return result;
    }

    formatLookup(lookup: any, direction?: string): string {
        let result = '';
        // append lookup direction e.g. LEFT JOIN
        switch (direction) {
            case 'left':
                result += 'LEFT JOIN ';
                break;
            case 'right':
                result += 'RIGHT JOIN ';
                break;
            default:
                result += 'INNER JOIN ';
                break;
        }
        if (lookup && lookup.localField && lookup.foreignField) {
            Args.notNull(lookup.from, 'Lookup collection');
            // append join collection e.g. LEFT JOIN Customers
            result += this.escapeCollection(lookup.from);
            if (lookup.as) {
                // append alias e.g. LEFT JOIN Customers AS c1
                result += ` ${this.settings.aliasKeyword} ${this.escapeCollection(lookup.as)}`;
            }
            result += ' ON ';
            const lookupCollection = lookup.as || lookup.from;
            // format foreign field e.g. Customers.CustomerID
            const foreignField = lookupCollection + '.' + lookup.foreignField;
            // append equality expression
            // e.g. LEFT JOIN Customers ON Customers.CustomerID = Orders.CustomerID
            result += this.$eq(`$${lookup.localField}`, `$${foreignField}`);
        }
        else if (lookup && lookup.pipeline) {
            // build expression
            const q = new QueryExpression().select()
                .from(lookup.from);
            if (lookup.pipeline.$project) {
                // append fields
                Object.assign(q, {
                    $select: lookup.pipeline.$project
                });
            }
            Args.check(lookup.pipeline.$match, new Error('Lookup match expression is null or undefined.'));
            // format selection
            const formatter = Object.create(this);
            // format query expression
            result += '(';
            result += formatter.formatSelect(q).replace(/;$/,'');
            result += ')';
            if (lookup.as) {
                // append alias e.g. LEFT JOIN (SELECT * FROM Customers) AS c1
                result += ` ${this.settings.aliasKeyword} ${this.escapeCollection(lookup.as)}`;
            }
            else {
                // append alias e.g. LEFT JOIN (SELECT * FROM Customers) AS Customers
                result += ` ${this.settings.aliasKeyword} ${this.escapeCollection(lookup.from)}`;
            }
            // format match expression
            result += ' ON ';
            formatter.currectCollection = lookup.as || lookup.from;
            result += formatter.formatWhere(lookup.pipeline.$match);
            formatter.currectCollection = null;
        }
        else {
            throw new Error('Lookup syntax has not been implemented yet.');
        }
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {*} expr
     * @returns {string}
     */
    formatLimitSelect(expr: any): string {

        const sql=this.formatSelect(expr);
        if (expr.$limit) {
            if (expr.$skip) {
                return sql + ` LIMIT ${expr.$skip}, ${expr.$limit}`
            }
            return sql + ` LIMIT ${expr.$limit}`
        }
        return sql;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {*} query
     * @returns {string}
     */
    formatCount(query: any): string {
        // validate select expression
        Args.check(query.$select != null, new ExpectedSelectExpression());
        // get count alias
        const alias = query.$count || 'total';
        // format select statement (ignore paging parameters even if there are exist)
        const sql = this.formatSelect(query);
        // return final count expression by setting the derived sql statement as sub-query
        // e.g. SELECT COUNT(*) AS `total` FROM (SELECT * FROM `UserData`) `c0`
        return `SELECT COUNT(*) AS ${this.escapeName(alias)} FROM (${sql}) ${this.escapeName('c0')}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Formats a fixed query expression where select fields are constants e.g. SELECT 1 AS `id`,'John' AS `givenName` etc
     * @param {*} query
     * @returns {string}
     */
    formatFixedSelect(query: any): string {
        // validate select expression
        Args.check(query.$select != null, new ExpectedSelectExpression());
        // get select fields
        const selectFields = Object.keys(query.$select);
        // validate select expression
        Args.check(selectFields.length, new Error('Invalid query expression. A fixed query expects at least one valid select expression.'));
        let result = 'SELECT * FROM (SELECT ';
        result += selectFields.map( key => {
            let res = this.escape(query.$select[key]);
            if (this.settings.aliasKeyword) {
                res += ` ${this.settings.aliasKeyword} ${this.escapeNameOnly(key)}`;
            }
            else {
                res += ` ${this.escapeNameOnly(key)}`;
            }
            return res;
        }).join(', ');
        result += ')';
        // add collection name as alias
        const selectCollection = Object.assign(new QueryCollection(), query.$collection);
        result += ' ' + this.escapeCollection(selectCollection.name);
        // format lookups
        this.currectCollection = selectCollection.name;
        if (query.$expand && query.$expand.length) {
            query.$expand.forEach((expand: any) => {
                result += ' ' + this.formatLookup(expand.$lookup, expand.$direction);
            });
        }
        // format where
        if (query.$match != null) {
            if (query.$prepared == null) {
                result += ' WHERE ' + this.formatWhere(query.$match);
            }
            else {
                result += ' WHERE ' + this.formatWhere({
                    $and: [
                        query.$prepared,
                        query.$match
                    ]
                });
            }
        }
        this.currectCollection = null;
        return result;
    }

    formatField(expr: any): string {
        Args.notNull(expr, 'Field expression');
        const name = getOwnPropertyName(expr);
        let result;
        const thisIndexer: PropertyIndexer = this;
        Args.check(name != null, new Error('Field name cannot be empty.'));
        // field expression is simple select e.g. { "dateCreated" : 1 }
        if (expr[name] === 1) {
            return this.escapeName(name);
        }
        let field = expr[name];
        // expression with method e.g. { "$count" : "$customer" }
        if (isMethodOrNameReference(name)) {
            field = expr;
        }
        // expression with alias e.g. { "createdAt" : "$dateCreated" }
        if (typeof field === 'string' && isMethodOrNameReference(field)) {
            return `${this.escapeName(field)} ${this.settings.aliasKeyword} ${this.escapeNameOnly(name)}`;
        }
        if (typeof field === 'object') {
            // field has an expression e.g. { "minPrice": { "$min": "$price" } }
            const funcName = getOwnPropertyName(field);
            if (isMethodOrNameReference(funcName)) {
                const formatFunc = thisIndexer[funcName];
                if (typeof formatFunc === 'function') {
                    const funcArgs = field[funcName];
                    let args = [];
                    if (Array.isArray(funcArgs)) {
                        args = funcArgs.slice();
                        args.unshift()
                    }
                    else {
                        args.push(funcArgs);
                    }
                    result = formatFunc.apply(this, args);
                    // if name is a method reference return without alias
                    if (isMethodOrNameReference(name)) {
                        return result;
                    }
                    if (this.settings.aliasKeyword) {
                        result += ` ${this.settings.aliasKeyword} `;
                    }
                    else {
                        result += ` `;
                    }
                    result += this.escapeNameOnly(name);
                    return result;
                }
            }
        }

        throw new Error('Field is invalid or syntax has not been implemented yet.');
    }


    formatWhere(expr: any): string {
        if (expr == null) {
            return '';
        }
        // get expression property e.g. { "givenName": { "$eq" : "John" } }
        // => givenName or { "$length" : "$givenName" } => $length
        const name = getOwnPropertyName(expr);
        const thisIndexer: PropertyIndexer = this;
        // if name is a method reference
        if (isMethodOrNameReference(name)) {
            // get format method
            const formatFunc = thisIndexer[name];
            if (typeof formatFunc === 'function') {
                return formatFunc.apply(this, expr[name]);
            }
            throw new Error('Invalid expression or bad syntax');
        }
        else {
            let args = [];
            // get compare expression e.g. { "$eq" : "John" }
            let comparerExpr = expr[name];
            // call format where by assigning field as first argument
            // e.g. { "$eq" : [ "$givenName",  "John" ] }
            const comparerName = getOwnPropertyName(comparerExpr);
            // get comparer arguments e.g. "John"
            const comparerArgs = comparerExpr[comparerName];
            if (Array.isArray(comparerArgs)) {
                // copy arguments
                args = comparerArgs.slice();
                // insert item
                args.unshift(`$${name}`);
            }
            else {
                args.push(`$${name}`);
                args.push(comparerArgs);
            }
            // create new comparer expression e.g. { "$eq": [ "$givenName", "John" ] }
            comparerExpr = { };
            comparerExpr[comparerName] = args;
            // format expression
            return this.formatWhere(comparerExpr);
        }

    }

    formatOrder(expr: any): string {
        if (expr == null) {
            return '';
        }
        const orderFields = Object.keys(expr);
        if (orderFields.length === 0) {
            // do nothing
            return '';
        }
        return orderFields.map( key => {
            if (isMethodOrNameReference(key) && typeof expr[key] !== 'number') {
                const field: PropertyIndexer = { };
                field[key] = expr[key];
                return this.escape(field) +  ' ' + (expr[key] === 1 ? 'DESC': 'ASC');
            }
            return this.escapeName(key) +  ' ' + (expr[key] === 1 ? 'DESC': 'ASC');
        }).join(', ');

    }

    formatGroupBy(expr: any): string {
        if (expr == null) {
            return '';
        }
        const groupFields = Object.keys(expr);
        if (groupFields.length === 0) {
            // do nothing
            return '';
        }
        return groupFields.map( key => {
            if (isMethodOrNameReference(key) && typeof expr[key] !== 'number') {
                const field: PropertyIndexer = { };
                field[key] = expr[key];
                return this.escape(field);
            }
            return this.escapeName(key);
        }).join(', ');
    }

    // noinspection JSUnusedGlobalSymbols
    formatInsert(query: any): string {
        Args.check(query.$insert != null, new ExpectedInsertExpression());
        // get collection name
        Args.check(query.$collection != null, new ExpectedCollection());
        const collection = Object.assign(new QueryCollection(), query.$collection);
        Args.notNull(collection.name, 'Collection name');
        const insertFields = Object.keys(query.$insert);
        Args.check(insertFields.length, new Error('Insert fields cannot be an empty array'));
        let result = `INSERT INTO ${this.escapeName(collection.name)}`;
        result += ' (';
        result += insertFields.map( key => {
            return this.escapeName(key);
        }).join(', ');
        result += ') VALUES (';
        result += insertFields.map( key => {
            return this.escape(query.$insert[key]);
        }).join(', ');
        result += ')';
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    formatUpdate(query: any): string {
        Args.check(query.$update != null, new ExpectedUpdateExpression());
        // get collection name
        Args.check(query.$collection != null, new ExpectedCollection());
        const collection = Object.assign(new QueryCollection(), query.$collection);
        Args.notNull(collection.name, 'Collection name');
        const updateFields = Object.keys(query.$update);
        Args.check(updateFields.length, new Error('Update fields cannot be an empty array'));
        let hasWhere = false;
        let result = `UPDATE ${this.escapeName(collection.name)}`;
        result += ' SET ';
        result += updateFields.map( key => {
            return `${this.escapeName(key)} = ${this.escape(query.$update[key])}`;
        }).join(', ');
        if (query.$prepared != null) {
            hasWhere = true;
            if (query.$match != null) {
                result += ' WHERE ';
                result += this.formatWhere({
                    $and: [ query.$prepared, query.$match ]
                });
            }
            else {
                result += ' WHERE ';
                result += this.formatWhere(query.$prepared);
            }
        }
        else if (query.$match != null) {
            hasWhere = true;
            result += ' WHERE ';
            result += this.formatWhere(query.$match);
        }
        Args.check(hasWhere, new ExpectedWhereExpression());
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    formatDelete(query: any): string {
        Args.check(query.$delete != null, new ExpectedDeleteExpression());
        // get collection name
        Args.check(query.$collection != null, new ExpectedCollection());
        const collection = Object.assign(new QueryCollection(), query.$collection);
        Args.notNull(collection.name, 'Collection name');
        let result = `DELETE FROM ${this.escapeName(collection.name)}`;
        let hasWhere = false;
        if (query.$prepared != null) {
            hasWhere = true;
            if (query.$match != null) {
                result += ' WHERE ';
                result += this.formatWhere({
                    $and: [ query.$prepared, query.$match ]
                });
            }
            else {
                result += ' WHERE ';
                result += this.formatWhere(query.$prepared);
            }
        }
        else if (query.$match != null) {
            hasWhere = true;
            result += ' WHERE ';
            result += this.formatWhere(query.$match);
        }
        Args.check(hasWhere, new ExpectedWhereExpression());
        return result;
    }

    format(expr: any): string {
        if (expr.$select) {
            if (expr.$count) {
                return this.formatCount(expr);
            }
            if (expr.$fixed) {
                return this.formatFixedSelect(expr);
            }
            if (expr.$limit) {
                return this.formatLimitSelect(expr);
            }
            return this.formatSelect(expr);
        }
        if (expr.$update) {
            return this.formatUpdate(expr);
        }
        if (expr.$insert) {
            return this.formatInsert(expr);
        }
        if (expr.$delete) {
            return this.formatDelete(expr);
        }
        if (expr.$where) {
            return this.formatWhere(expr.$where);
        }
        throw new Error('Unkown expression');
    }

    /**
     * Implements AND operator formatting
     */
    $and() {
        const conditions = Array.from(arguments);
        Args.check(conditions.length, 'Expected at least one expression.');
        let result = '(';
        result += conditions.map(condition => {
            return this.formatWhere(condition);
        }).join(' AND ');
        result += ')';
        return result;
    }

    /**
     * Implements OR operator formatting
     */
    $or() {
        const conditions = Array.from(arguments);
        Args.check(conditions.length, 'Expected at least one expression.');
        let result = '(';
        result += conditions.map(condition => {
            return this.formatWhere(condition);
        }).join(' OR ');
        result += ')';
        return result;
    }

    /**
     * Formats an equality expression e.g. { "id": { $eq: 100 } }
     */
    $eq(left: any, right: any): string {
        if (right == null) {
            return `${this.escape(left)} IS NULL`;
        }
        if (Array.isArray(right)) {
            return this.$in(left, right);
        }
        return `${this.escape(left)} = ${this.escape(right)}`;
    }

    $in(left: any, right: any): string {
        const leftOperand = this.escape(left);
        if (right == null) {
            return `${leftOperand} IS NULL`;
        }
        if (Array.isArray(right)) {
            if (right.length === 0) {
                return `${leftOperand} IS NULL`;
            }
            const values = right.map( x => {
                return this.escape(x);
            });
            return `${leftOperand} IN (${values.join(', ')})`;
        }
        throw new Error('Invalid in expression. Right operand must be an array');
    }

    $nin(left: any, right: any): string {
        return `NOT ${this.$in(left, right)}`;
    }

    $ne(left: any, right: any): string {
        if (right == null) {
            return `NOT (${this.escape(left)} IS NULL)`;
        }
        return `NOT (${this.escape(left)} = ${this.escape(right)})`;
    }

    $gt(left: any, right: any): string {
        return `${this.escape(left)} > ${this.escape(right)}`;
    }

    $gte(left: any, right: any): string {
        return `${this.escape(left)} >= ${this.escape(right)}`;
    }

    $lt(left: any, right: any): string {
        return `${this.escape(left)} < ${this.escape(right)}`;
    }

    $lte(left: any, right: any): string {
        return `${this.escape(left)} <= ${this.escape(right)}`;
    }

    /**
     * Implements count() aggregate expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $count(p0: any): string {
        return `COUNT(${this.escape(p0)})`;
    }

    /**
     * Implements min() aggregate expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $min(p0: any): string {
        return `MIN(${this.escape(p0)})`;
    }

    /**
     * Implements MAX() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $max(p0: any): string {
        return `MAX(${this.escape(p0)})`;
    }

    /**
     * Implements AVG() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $avg(p0: any): string {
        return `AVG(${this.escape(p0)})`;
    }

    /**
     * Implements SUM() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $sum(p0: any): string {
        return `SUM(${this.escape(p0)})`;
    }

    /**
     * Implements YEAR() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $year(p0: any): string {
        return `YEAR(${this.escape(p0)})`;
    }

    /**
     * Implements MONTH() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $month(p0: any): string {
        return `MONTH(${this.escape(p0)})`;
    }

    /**
     * Implements DAY() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $dayOfMonth(p0: any): string {
        return `DAY(${this.escape(p0)})`;
    }

    /**
     * Implements HOUR() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $hour(p0: any): string {
        return `HOUR(${this.escape(p0)})`;
    }

    /**
     * Implements HOUR() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $minute(p0: any): string {
        return `MINUTE(${this.escape(p0)})`;
    }

    /**
     * Implements SECOND() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $second(p0: any): string {
        return `SECOND(${this.escape(p0)})`;
    }

    /**
     * Implements DATE() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $date(p0: any): string {
        return `DATE(${this.escape(p0)})`;
    }

    /**
     * Implements FLOOR() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $floor(p0: any): string {
        return `FLOOR(${this.escape(p0)})`;
    }

    /**
     * Implements CEILING() sql expression formatting.
     * @param {*} p0
     * @returns {*}
     */
    $ceil(p0: any): string {
        return `CEILING(${this.escape(p0)})`;
    }

    /**
     * Implements ROUND() expression formatter.
     * @param {*} p0
     * @param {*=} p1
     * @returns {string}
     */
    $round(p0: any, p1: any): string {
        if (p1 == null) {
            return `ROUND(${this.escape(p0)}, ${this.escape(p1)})`;
        }
        return `ROUND(${this.escape(p0)}, 0)`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Implements regular expression formatting.
     * @param {*} left
     * @param {string|*} expr
     * @returns {string}
     */
    $regex(left: any, expr: any): string {
        return `(${this.escape(left)} REGEXP '${this.escape(expr, true)}')`;
    }

    /**
     * Implements text() expression formatter.
     * @param {string|*} p0
     * @param {string|*} p1
     * @returns {string}
     */
    $text(p0: any, p1: any): string {
        return `(${this.escape(p0)} REGEXP '${this.escape(p1, true)}')`;
    }

    /**
     * Implements length() expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $length(p0: any): string {
        return `LENGTH(${this.escape(p0)})`;
    }

    /**
     * Implements trim(a) expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $trim(p0: any): string {
        return `TRIM(${this.escape(p0)})`;
    }

    /**
     * Implements concat(a,b,...) expression formatter.
     * @param {*...} p0
     * @returns {string}
     */
    $concat(): string {
        const args = Array.from(arguments);
        const strArgs = args.map( arg => {
            return this.escape(arg);
        }).join(', ');
        return `CONCAT(${strArgs})`;
    }

    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexOfBytes(p0: any, p1: any): string {
        return `(LOCATE(${this.escape(p0)},${this.escape(p1)})-1)`;
    }

    /**
     * Implements SUBSTRING() sql expression formatter.
     * @param {String} p0 The source string
     * @param {Number} pos The starting position
     * @param {Number=} length The length of the resulted string
     * @returns {string}
     */
    $substr(p0: any, pos: number, length?: number): string {
        if (length) {
            return `SUBSTRING(${this.escape(p0)},${pos + 1},${length})`;
        }
        else {
            return `SUBSTRING(${this.escape(p0)},${pos + 1})`;
        }
    }

    /**
     * Implements LOWER() sql expression formatting.
     * @param {String} p0
     * @returns {string}
     */
    $toLower(p0: any): string {
        return `LOWER(${this.escape(p0)})`;
    }

    /**
     * Implements UPPER() sql expression formatting.
     * @param {String} p0
     * @returns {string}
     */
    $toUpper(p0: any): string {
        return `UPPER(${this.escape(p0)})`;
    }

    /**
     * Implements a + b sql expression formatting.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $add(p0: any, p1: any): string {
        return `(${this.escape(p0)} + ${this.escape(p1)})`;
    }

    /**
     * Implements a - b sql expression formatting.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $subtract(p0: any, p1: any): string {
        return `(${this.escape(p0)} - ${this.escape(p1)})`;
    }

    /**
     * Implements a * b sql expression formatting.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $multiply(p0: any, p1: any): string {
        return `(${this.escape(p0)} * ${this.escape(p1)})`;
    }

    /**
     * Implements a * b sql expression formatting.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $divide(p0: any, p1: any): string {
        return `(${this.escape(p0)} / ${this.escape(p1)})`;
    }

    /**
     * Implements [a % b] sql expression formatter.
     * @param p0 {*}
     * @param p1 {*}
     */
    $mod(p0: any, p1: any): string {
        return `(${this.escape(p0)} % ${this.escape(p1)})`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Implements [a & b] bitwise and expression formatter.
     * @param p0 {*}
     * @param p1 {*}
     */
    $bit(p0: any, p1: any): string {
         return `(${this.escape(p0)} & ${this.escape(p1)})`;
    }

    private isComparison(obj: any): boolean {
        let key;
        for(let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop))
                {
                    key = prop;
                    break;
                }
        }
        if (key == null) {
            return;
        }
        return (/^\$(eq|ne|lt|lte|gt|gte|in|nin|text|regex)$/g.test(key));
    }

    $cond(ifExpr: any, thenExpr: any, elseExpr: any) {
        // validate ifExpr which should an instance of QueryExpression or a comparison expression
        let ifExpression: string;
        if (instanceOf(ifExpr, QueryExpression)) {
            ifExpression = this.formatWhere(ifExpr.$where || ifExpr.$match);
        } else if (this.isComparison(ifExpr)) {
            ifExpression = this.formatWhere(ifExpr);
        } else {
            throw new Error('Condition parameter should be an instance of query or comparison expression');
        }
        return `(CASE ${ifExpression} WHEN 1 THEN ${this.escape(thenExpr)} ELSE ${this.escape(elseExpr)} END)`;
    }

    /**
     * Formats a switch expression
     * e.g. CASE WHEN weight>100 THEN 'Heavy' WHEN weight<20 THEN 'Light' ELSE 'Normal' END
     * @param {{branches: Array<{ case: *, then: * }>, default: *}} expr
     * @returns {string}
     */
     $switch(expr: any): string {
        const branches = expr.branches;
        const defaultValue = expr.default;
        if (Array.isArray(branches) === false) {
            throw new Error('Switch branches must be an array');
        }
        if (branches.length === 0) {
            throw new Error('Switch branches cannot be empty');
        }
        let str = '(CASE';
        str += ' ';
        str += branches.map((branch: any) => {
            let caseExpression;
            if (instanceOf(branch.case, QueryExpression)) {
                caseExpression = this.formatWhere(branch.case.$where);
            } else if (this.isComparison(branch.case)) {
                caseExpression = this.formatWhere(branch.case);
            } else {
                throw new Error('Case expression should be an instance of query or comparison expression');
            }
            return `WHEN ${caseExpression} THEN ${this.escape(branch.then)}`;
        }).join(' ');
        if (typeof defaultValue !== 'undefined') {
            str += ' ELSE ';
            str += this.escape(defaultValue);
        }
        str += ' END)';
        return str;
    }

}

export {
    SqlFormatter
};
