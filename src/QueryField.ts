// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

import { Args } from '@themost/common';
import { getOwnPropertyName, isMethodOrNameReference, PropertyIndexer } from './query';


class QueryField {
    constructor(name?: string) {
        if (name) {
            Args.notString(name, 'QueryField.name');
            // set default field selection e.g. { "name": 1 }
            Object.defineProperty(this, name, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: 1
            });
        }
    }
    /**
     * @private
     * @param {string} name
     */
    _toReference(name: string): string {
        Args.notEmpty(name, 'name');
        return name.split('.').map(key => {
            if (isMethodOrNameReference(key)) {
                return key;
            }
            return `$${key}`;
        }).join('.');
    }
    /**
     * @private
     * @param {string} method
     */
    _assignMethod(method: string) {
        const args = Array.from(arguments).slice(1).map(arg => {
            if (arg instanceof QueryField) {
                // get first property
                const key = getOwnPropertyName(arg);
                // if key value is only a simple reference e.g. { "firstName": 1 }
                if ((<PropertyIndexer>arg)[key] === 1) {
                    // return field reference name e.g. $firstName or $Person.$firstName
                    return this._toReference(key);
                }
                // otherwise return instance of query field
                return arg;
            }
            return arg;
        });
        let value;
        // get object first property
        const thisName = getOwnPropertyName(this);
        // if name is a method reference e.g. { $day: "$dateCreated" } => $day
        const isMethod = isMethodOrNameReference(thisName);
        const thisIndexer = (<PropertyIndexer>this);
        if (isMethod) {
            // assign previous property value to new method e.g.
            // { $min: { $day: "$dateCreated" } }
            thisIndexer[method] = { };
            // if method has arguments
            if (args.length > 0) {
                // insert field as first argument e.g.
                // validate first parameter e.g. { $multiply: [ "$price", 0.7 ] }
                if (Array.isArray(thisIndexer[thisName])) {
                    // clone value
                    value = {};
                    // clone property
                    // e.g. { $multiply: [ "$price", 0.7 ] }
                    Object.defineProperty(value, thisName, { value: thisIndexer[thisName], configurable: true, enumerable: true, writable: true });
                    // set this value as first argument
                    args.unshift(value);
                }
                else {
                    value = this._toReference(thisName);
                    args.unshift(value);
                }
                // finally wrap existing property
                // e.g. { $add: [ { $multiply: [ "$price", 0.7 ] }, 25 ] }
                thisIndexer[method] = args;
            }
            else {
                // else use only field reference
                value = thisIndexer[thisName];
                Object.defineProperty(thisIndexer[method], this._toReference(thisName), { value: value, configurable: true, enumerable: true, writable: true });
            }
            // remove previous property reference
            delete thisIndexer[thisName];
            // and finally return
            return this;
        }
        // validate if underlying expression a single select expression e.g. { "name": 1 }
        if (thisIndexer[thisName] === 1) {
            // if method has arguments
            if (args.length > 0) {
                // insert field as first argument e.g.
                args.unshift(this._toReference(thisName));
                // set value
                value = args;
            }
            else {
                // else use only field reference
                value = `$${thisName}`;
            }
            // set property descriptor
            Object.defineProperty(this, `${method}`, { value: value, configurable: true, enumerable: true, writable: true });
            // remove previous property
            delete thisIndexer[thisName];
            // and return
            return this;
        }
        throw new Error('Query object has an invalid state or its graph has not yet implemented.');
    }
    /**
     * Prepares a query by settings the alias of an expression e.g. { "createdAt": "$dateCreated" }
     * @params {string} alias
     * @returns this
     */
    as(alias: string): this {
        Args.notString(alias, 'Query field alias');
        return this._assignMethod(alias);
    }
    /**
     * Prepares a query which returns the count of an expression
     * @returns this
     */
    count(): this {
        return this._assignMethod('$count');
    }
    /**
     * Prepares a query which returns the minimum value of an expression
     * @returns this
     */
    min(): this {
        return this._assignMethod('$min');
    }
    /**
     * Prepares a query which returns the maximum value of an expression
     * @returns this
     */
    max(): this {
        return this._assignMethod('$max');
    }
    /**
     * Prepares a query which returns the sum of an expression
     * @returns this
     */
    sum(): this {
        return this._assignMethod('$sum');
    }
    /**
     * Prepares a query which returns the average value of an expression
     * @returns this
     */
    avg(): this {
        return this._assignMethod('$avg');
    }
    /**
     * Prepares a query which returns the average value of an expression
     * @returns this
     */
    average(): this {
        return this._assignMethod('$avg');
    }
    /**
     * Prepares a query which returns the date of month of a date expression
     * @returns this
     */
    getDate(): this {
        return this._assignMethod('$dayOfMonth');
    }
    /**
     * Prepares a query which returns the date only value of a date expression
     * @returns this
     */
    toDate(): this {
        return this._assignMethod('$date');
    }
    /**
     * Prepares a query which returns the day of week of a date expression
     */
    getDay(): this {
        return this._assignMethod('$dayOfWeek');
    }
    /**
     * Prepares a query which returns the month of a date expression
     * @returns this
     */
    getMonth(): this {
        return this._assignMethod('$month');
    }
    /**
     * Prepares a query which returns the year of a date expression
     * @returns this
     */
    getYear(): this {
        return this._assignMethod('$year');
    }
    /**
     * Prepares a query which returns the hours of a date expression
     * @returns this
     */
    getHours(): this {
        return this._assignMethod('$hour');
    }
    /**
     * Prepares a query which returns the minutes of a date expression
     * @returns this
     */
    getMinutes(): this {
        return this._assignMethod('$minute');
    }
    /**
     * Prepares a query which returns the seconds of a date expression
     * @returns this
     */
    getSeconds(): this {
        return this._assignMethod('$second');
    }
    /**
     * Prepares a query which returns the length of a string expression
     * @returns this
     */
    length(): this {
        return this._assignMethod('$length');
    }
    /**
     * Prepares a query which removes whitespace from the beginning and the end of an expression
     * @returns this
     */
    trim(): this {
        return this._assignMethod('$trim');
    }
    /**
     * Prepares a query which returns the largest integer less than or equal  of an expression
     * @returns this
     */
    floor(): this {
        return this._assignMethod('$floor');
    }
    /**
     * Prepares a query which returns the smallest integer greater than or equal  of an expression
     * @returns this
     */
    ceil(): this {
        return this._assignMethod('$ceil');
    }
    /**
     * Prepares a query which returns a concatenated string of an expression
     * @returns this
     */
    concat(...args: any): this {
        args.unshift('$concat');
        return this._assignMethod.apply(this, args);
    }
    /**
     * Prepares a query which subtracts two parameters and returns the difference
     * @params {*} x
     * @returns this
     */
    subtract(x: any): this {
        return this._assignMethod.apply(this, ['$subtract', x]);
    }
    /**
     * Prepares a query which adds two parameters and returns the result
     * @params {*} x
     * @returns this
     */
    add(x: any): this {
        return this._assignMethod.apply(this, ['$add', x]);
    }
    /**
     * Prepares a query which multiplies parameters together and returns the result
     * @params {*} x
     * @returns this
     */
    multiply(x: any): this {
        return this._assignMethod.apply(this, ['$multiply', x]);
    }
    /**
     * Prepares a query which divide one parameter from another and returns the result
     * @params {*} x
     * @returns this
     */
    divide(x: any): this {
        return this._assignMethod.apply(this, ['$divide', x]);
    }
    /**
     * Prepares a query which divide one parameter from another and returns the remainder
     * @params {*} x
     */
    mod(x: any): this {
        return this._assignMethod.apply(this, ['$mod', x]);
    }
    /**
     * Prepares a query which rounds a parameter to a specified decimal place and returns the remainder
     * @params {*=} n
     * @returns this
     */
    round(n?: any): this {
        if (n) {
            return this._assignMethod.apply(this, ['$round', n]);
        }
        return this._assignMethod.apply(this, ['$round', 0]);
    }
    /**
     * Prepares a query which returns a substring of an expression
     * @params {number} start - A number which represents the start index position
     * @params {number=} length - A number which represents the length of the including characters. If length is a negative substring  includes the rest of string
     * @returns this
     */
    substr(start: number, length?: number): this {
        if (length == null) {
            return this._assignMethod.apply(this, ['$substr', start, -1]);
        }
        return this._assignMethod.apply(this, ['$substr', start, length]);
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toLowerCase(): this {
        return this._assignMethod('$toLower');
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toLocaleLowerCase(): this {
        return this.toLowerCase();
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toUpperCase(): this {
        return this._assignMethod('$toUpper');
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toLocaleUpperCase(): this {
        return this.toUpperCase();
    }
    /**
     * Prepares a query which returns the index of the first occurrence of an expression within expression
     * @params {any} x - An expression to search for e.g a string
     * @params {number=} start - The starting index position for the search.
     * @returns this
     */
    indexOf(x: any, start?: number): this {
        if (start == null) {
            return this._assignMethod.apply(this, ['$indexOfBytes', x]);
        }
        return this._assignMethod.apply(this, ['$indexOfBytes', x, start]);
    }
}
export {
    QueryField
};