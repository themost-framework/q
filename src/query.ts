// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {hasOwnProperty} from './has-own-property';
// eslint-disable-next-line no-unused-vars
//noinspection JSUnusedLocalSymbols

const REFERENCE_REGEXP = /^\$/;

// noinspection JSUnusedGlobalSymbols
/**
 * Returns a string which represents the name of the first property of an object
 * @param {*} obj
 * @returns {*}
 */
function getOwnPropertyName(obj: any): string {
    if (obj) {
        // noinspection LoopStatementThatDoesntLoopJS
        for(const key in obj) {
            if  (hasOwnProperty(obj, key)) {
                return key;
            }
        }
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Returns true if the specified string is a method (e.g. $concat) or name reference (e.g. $dateCreated)
 * @param {string} str
 * @returns {*}
 */
function isMethodOrNameReference(str: string): boolean {
    return REFERENCE_REGEXP.test(str)
}

// noinspection JSUnusedGlobalSymbols
/**
 * Returns a string which indicates that the given string is following name reference format.
 * @param {string} str
 * @returns {string}
 */
function hasNameReference(str: string): string {
    if (str) {
        if (REFERENCE_REGEXP.test(str)) {
            return str.substr(1);
        }
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Returns a string which indicates that the given object has a property with a name reference
 * e.g. $UserTable, $name etc.
 * @param {*} obj
 * @returns {string|*}
 */
function getOwnPropertyWithNameRef(obj: any): string {
    if (obj) {
        // tslint:disable-next-line:forin
        for(const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && REFERENCE_REGEXP.test(key)) {
                return key;
            }
            break;
        }
    }
}

interface PropertyIndexer {
    [x: string]: any;
}

export {
    REFERENCE_REGEXP,
    getOwnPropertyName,
    isMethodOrNameReference,
    hasNameReference,
    getOwnPropertyWithNameRef,
    PropertyIndexer
};