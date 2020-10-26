// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {hasOwnProperty} from './has-own-property';
/**
 * @param {string} tz
 */
function convertTimezone(tz: string) {
    if (tz === "Z") return 0;
    const m = tz.match(/([+\-\s])(\d\d):?(\d\d)?/);
    if (m) {
        return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
    }
    return false;
}

function zeroPad(number: any, length?: number) {
    number = number.toString();
    while (number.length < length) {
        number = '0' + number;
    }
    return number;
}

function dateToString(date: Date, timeZone: string) {
    const dt = new Date(date);

    if (timeZone !== 'local') {
        const tz = convertTimezone(timeZone);

        dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
        if (tz !== false) {
            dt.setTime(dt.getTime() + (tz * 60000));
        }
    }

    const year   = dt.getFullYear();
    const month  = zeroPad(dt.getMonth() + 1, 2);
    const day    = zeroPad(dt.getDate(), 2);
    const hour   = zeroPad(dt.getHours(), 2);
    const minute = zeroPad(dt.getMinutes(), 2);
    const second = zeroPad(dt.getSeconds(), 2);
    const millisecond = zeroPad(dt.getMilliseconds(), 3);

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
}


function bufferToString(buffer: Buffer) {
    let hex = '';
    try {
        hex = buffer.toString('hex');
    } catch (err) {
        // node v0.4.x does not support hex / throws unknown encoding error
        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            // noinspection JSCheckFunctionSignatures
            hex += zeroPad(byte.toString(16));
        }
    }

    return "X'" + hex + "'";
}

function objectToValues(object: any, timeZone: any) {
    const values = [];
    for (const key in object) {
        if (hasOwnProperty(object, key)) {
            const value = object[key];
            if(typeof value === 'function') {
                continue;
            }
            values.push(escapeId(key) + ' = ' + escape(value, true, timeZone));
        }
    }
    return values.join(', ');
}

function arrayToList(array: Array<any>, timeZone: string): string {
    return array.map(v => {
        if (Array.isArray(v)) return '(' + arrayToList(v, timeZone) + ')';
        return escape(v, true, timeZone);
    }).join(', ');
}

function escapeId(val: any, forbidQualified?: any): string {
    if (Array.isArray(val)) {
        return val.map(v => {
            return escapeId(v, forbidQualified);
        }).join(', ');
    }

    if (forbidQualified) {
        return '`' + val.replace(/`/g, '``') + '`';
    }
    return '`' + val.replace(/`/g, '``').replace(/\./g, '`.`') + '`';
}
// eslint-disable-next-line no-control-regex
const STR_ESCAPE_REGEXP = /[\0\n\r\b\t\\'"\x1a]/g;

function escape(val: any, stringifyObjects?: boolean, timeZone?: string): string {
    if (typeof val === 'undefined' || val === null) {
        return 'NULL';
    }

    switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val+'';
    }

    if (val instanceof Date) {
        val = dateToString(val, timeZone || 'local');
    }

    if (Buffer.isBuffer(val)) {
        return bufferToString(val);
    }

    if (Array.isArray(val)) {
        return arrayToList(val, timeZone);
    }

    if (typeof val === 'object') {
        if (stringifyObjects) {
            val = val.toString();
        } else {
            return objectToValues(val, timeZone);
        }
    }
    val = val.replace(STR_ESCAPE_REGEXP, (s: string) => {
        switch(s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\"+s;
        }
    });
    return "'"+val+"'";
}

function format(sql: string, values: any, stringifyObjects?: boolean, timeZone?: string): string {
    values = (typeof values === 'undefined' || values === null) ? [] : [].concat(values);
    let index = 0;
    return sql.replace(/\?\??/g, match => {
        if (index === values.length) {
            return match;
        }
        const value = values[index++];
        return match === '??'
            ? escapeId(value)
            : escape(value, stringifyObjects, timeZone);
    });
}

// noinspection JSUnusedGlobalSymbols
/**
 * @class
 * @constructor
 */
class SqlUtils {
    /**
     * Escapes the given value and returns an equivalent string which is going to be used in SQL expressions.
     * @param {*} val
     * @returns {*}
     */
    static escape(val: any): any {
        return escape(val);
    }

    static format(sql: string, values: Array<any>) {
        return format(sql, values);
    }

    static zeroPad(number: any, length?: number) {
        return zeroPad(number, length);
    }
}

export {
    SqlUtils
};