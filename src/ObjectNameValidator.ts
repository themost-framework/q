// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

class InvalidObjectNameError extends Error {
    code?: string;
    /**
     * @param {string=} msg
     */
    constructor(msg?: string) {
        super(msg || 'Invalid database object name.');
        this.code = 'ERR_INVALID_NAME';
    }
}

/**
 * @class
 */
class ObjectNameValidator {
    pattern: RegExp;
    qualifiedPattern?: RegExp;

    static readonly Patterns = {
        Default: '([a-zA-Z0-9_]+)',
        Latin: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u005F]+)',
        LatinExtended: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00A0-\u024F\u005F]+)',
        Greek: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u0386-\u03CE\u005F]+)',
        Cyrillic: '([\u0030-\u0039\u0041-\u007A\u0061-\u007A\u0400-\u04FF\u005F]+)',
        Hebrew: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u05D0-\u05F2\u005F]+)'
    }

    static validator: ObjectNameValidator;

    /**
     * @param {string=} pattern
     */
    constructor(pattern?: string) {
        /**
         * Gets or sets object name pattern
         * @type {RegExp}
         */
        this.pattern = new RegExp(pattern || ObjectNameValidator.Patterns.Default);
        /**
         * Gets or sets qualified object name pattern
         * @type {RegExp}
         */
        this.qualifiedPattern = new RegExp(`^\\*$|^${this.pattern.source}((\\.)${this.pattern.source})*(\\.\\*)?$`);
    }
    /**
     * @param {string} name - A string which defines a query field name or an alias
     * @param {boolean=} qualified - Indicates whether validator will check a qualified object name e.g. schema1.Table1.field1 The default value is true
     * @param {boolean=} throwError - Indicates whether validator will throw error on failure or not. The default value is true.
     * @returns boolean
     */
    test(name: string, qualified?: boolean, throwError?: boolean) {
        const qualifiedName = typeof qualified === 'undefined' ? true : !!qualified;
        let pattern;
        if (qualifiedName) {
            pattern = new RegExp(this.qualifiedPattern.source, 'g');
        } else {
            pattern = new RegExp('^' + this.pattern.source + '$', 'g');
        }
        const valid = pattern.test(name);
        if (valid === false) {
            const shouldThrow = typeof throwError === 'undefined' ? true : !!throwError;
            if (shouldThrow) {
                throw new InvalidObjectNameError();
            }
        }
        return valid;
    }
    /**
     * Escapes the given base on the format provided
     * @param {string} name - The object name
     * @param {string=} format - The format that is going to be used for escaping name e.g. [$1] or `$1`
     */
    escape(name: string, format?: string) {
        // validate qualified object name
        this.test(name);
        const pattern = new RegExp(this.pattern.source, 'g');
        return name.replace(pattern, format || '$1');
    }
    /**
     * Defines the current query field validator
     * @param {ObjectNameValidator} validator
     * @returns {void}
     */
    static use(validator: ObjectNameValidator): void {
        if (validator instanceof ObjectNameValidator) {
            Object.defineProperty(ObjectNameValidator, 'validator', {
                configurable: true,
                enumerable: false,
                get: function () {
                    return validator;
                }
            });
            return;
        }
        throw new TypeError('Invalid validator. Expected an instance of QueryFieldValidator class.');
    }
}

// use default object name validator
ObjectNameValidator.use(new ObjectNameValidator());

export {
    ObjectNameValidator,
    InvalidObjectNameError
}