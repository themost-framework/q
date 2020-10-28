// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { PropertyIndexer } from "./query";

class ArithmeticExpression {
    static readonly ArithmeticOperators = [ "$add", "$subtract", "$multiply", "$divide", "$mod", "$bit" ];

    static isArithmeticOperator(operator: string): boolean {
        return ArithmeticExpression.ArithmeticOperators.indexOf(operator) >= 0;
    }

    public left: any;
    public operator: string;
    public right: any
    constructor(leftOperand: any, operator: string, rightOperand: any) {
        this.left = leftOperand;
        this.operator = operator || '$add';
        this.right = rightOperand;
    }

    exprOf() {
        if (this.left == null) {
            throw new Error('Expected left operand');
        }
        if (this.operator == null)
            throw new Error('Expected arithmetic operator.');
        if (!ArithmeticExpression.isArithmeticOperator(this.operator)) {
            throw new Error('Invalid arithmetic operator.');
        }
        // build right operand e.g. { $add:[ 5 ] }
        const result: PropertyIndexer = { };
        Object.defineProperty(result, this.operator, {
            value: [ this.left.exprOf(), this.right.exprOf() ],
            enumerable: true,
            configurable: true
        });
        if (this.right == null) {
            result[this.operator]=[null];
        }
        // return query expression
        return result;
    }
}


class MemberExpression {
    public name: string;
    constructor(name: string) {
        this.name = name;
    }

    exprOf() {
        return `$${this.name}`;
    }
}

class LogicalExpression {

    static readonly LogicalOperators = [ "$and", "$or", "$not", "$nor" ];

    static isLogicalOperator(operator: string): boolean {
        return LogicalExpression.LogicalOperators.indexOf(operator) >= 0;
    }

    public operator: string;
    public args: any[];
    constructor(operator: string, args?: any[]) {
        this.operator = operator || '$and' ;
        this.args = args || [];
    }

    exprOf() {
        if (LogicalExpression.isLogicalOperator(this.operator) === false)
            throw new Error('Invalid logical operator.');
        if (Array.isArray(this.args) === false)
            throw new Error('Logical expression arguments cannot be null at this context.');
        if (this.args.length===0)
            throw new Error('Logical expression arguments cannot be empty.');
        const p: PropertyIndexer = {};
        p[this.operator] = [];
        for (const arg of this.args) {
            if (arg == null)
                p[this.operator].push(null);
            else if (typeof arg.exprOf === 'function')
                p[this.operator].push(arg.exprOf());
            else
                p[this.operator].push(arg);
        }
        return p;
    }
}


/**
 * @class
 * @param {*} value The literal value
 * @constructor
 */
class LiteralExpression {
    public value: any;
    constructor(value: any) {
        this.value = value;
    }

    exprOf() {
        if (typeof this.value === 'undefined') {
            return null;
        }
        return this.value;
    }
}

class ComparisonExpression {

    static readonly ComparisonOperators = [ "$eq", "$ne", "$lte", "$lt", "$gte", "$gt", "$in", "$nin" ];

    static isComparisonOperator(operator: string): boolean {
        return ComparisonExpression.ComparisonOperators.indexOf(operator) >= 0;
    }

    public left: any;
    public operator: string;
    public right: any
    constructor(leftOperand: any, operator: string, rightOperand: any) {
        this.left = leftOperand;
        this.operator = operator || '$eq';
        this.right = rightOperand;
    }

    exprOf() {
        if (typeof this.operator === 'undefined' || this.operator===null)
            throw new Error('Expected comparison operator.');

        let p: PropertyIndexer;
        if ((this.left instanceof MethodCallExpression) ||
            (this.left instanceof ArithmeticExpression))
        {
            p = {};
            p[this.operator] = [];
            p[this.operator].push(this.left.exprOf());
            if (this.right && typeof this.right.exprOf === 'function') {
                p[this.operator].push(this.right.exprOf());
            } else {
                p[this.operator].push(this.right == null ? null : this.right);
            }
            return p;
        }
        else if (this.left instanceof MemberExpression) {
            p = { };
            Object.defineProperty(p, this.left.name, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: {}
            });
            if (this.right && typeof this.right.exprOf === 'function')
            {
                p[this.left.name][this.operator] = this.right.exprOf();
            }
            else
            {
                p[this.left.name][this.operator] = (this.right == null ? null : this.right);
            }
            return p;
        }
        throw new Error('Comparison expression has an invalid left operand. Expected a method call, an arithmetic or a member expression.');
    }
}

class MethodCallExpression {
    public name: string;
    public args: any[];
    constructor(name: string, args: any[]) {
        /**
         * Gets or sets the name of this method
         * @type {String}
         */
        this.name = name;
        /**
         * Gets or sets an array that represents the method arguments
         * @type {Array}
         */
        this.args = [];
        if (Array.isArray(args))
            this.args = args;
    }

    /**
     * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
     * @returns {*}
     */
    exprOf(): any {
        const method: PropertyIndexer = {};
        const name = '$'.concat(this.name);
        // set arguments array
        if (this.args.length===0)
            throw new Error('Unsupported method expression. Method arguments cannot be empty.');
        if (this.args.length === 1) {
            const arg = this.args[0];
            if (arg == null) {
                throw new Error('Method call argument cannot be null at this context.');
            }
            method[name] = arg.exprOf();
        }
        else {
            method[name] = this.args.map(value => {
                if (value == null) {
                    return null;
                }
                if (typeof value.exprOf === 'function') {
                    return value.exprOf();
                }
                return value;
            })
        }
        return method;
    }
}

class SequenceExpression {
    public value: any[];
    constructor() {
        //
        this.value = [];
    }

    exprOf() {
        // eslint-disable-next-line no-empty-pattern
        return this.value.reduce((previousValue, currentValue, currentIndex) => {
            if (currentValue instanceof MemberExpression) {
                Object.defineProperty(previousValue, currentValue.name, {
                    value: 1,
                    enumerable: true,
                    configurable: true
                });
                return previousValue;
            }
            else if (currentValue instanceof MethodCallExpression) {
                // validate method name e.g. Math.floor and get only the last part
                const name = currentValue.name.split('.');
                Object.defineProperty(previousValue, `${name[name.length-1]}${currentIndex}`, {
                    value: currentValue.exprOf(),
                    enumerable: true,
                    configurable: true
                });
                return previousValue;
            }
            throw new Error('Sequence expression is invalid or has a member which its type has not implemented yet');
        }, {});
    }

}

class ObjectExpression {
    constructor() {
        //
    }
    exprOf() {
        const finalResult = { };
        const thisIndexer: PropertyIndexer = this;
        Object.keys(this).forEach( key => {
            if (typeof thisIndexer[key].exprOf === 'function') {
                Object.defineProperty(finalResult, key, {
                    value: thisIndexer[key].exprOf(),
                    enumerable: true,
                    configurable: true
                });
                return;
            }
            throw new Error('Object expression is invalid or has a member which its type has not implemented yet');
        });
        return finalResult;
    }
}

/**
 * @enum
 */
class Operators {
    static get Not() {
        return '$not';
    }
    static get Mul() {
        return '$multiply';
    }
    static get Div() {
        return '$divide';
    }
    static get Mod() {
        return '$mod';
    }
    static get Add() {
        return '$add';
    }
    static get Sub() {
        return '$subtract';
    }
    static get Lt() {
        return '$lt';
    }
    static get Gt() {
        return '$gt';
    }
    static get Le() {
        return '$lte';
    }
    static get Ge() {
        return '$gte';
    }
    static get Eq() {
        return '$eq';
    }
    static get Ne() {
        return '$ne';
    }
    static get In() {
        return '$in';
    }
    static get NotIn() {
        return '$nin';
    }
    static get And() {
        return '$and';
    }
    static get Or() {
        return '$or';
    }
    static get BitAnd() {
        return '$bit';
    }
}


export {
    ArithmeticExpression,
    MemberExpression,
    LogicalExpression,
    LiteralExpression,
    ComparisonExpression,
    MethodCallExpression,
    SequenceExpression,
    ObjectExpression,
    Operators
}