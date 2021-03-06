// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {
    LiteralExpression,
    ObjectExpression,
    Operators,
    SequenceExpression,
    MemberExpression,
    MethodCallExpression,
    ArithmeticExpression,
    ComparisonExpression,
    LogicalExpression
} from './expressions';
import {parseScript} from 'esprima';
import {Args} from '@themost/common';
import {MathJsMethodParser} from './MathJsMethodParser';
import {MathMethodParser} from './MathMethodParser';
import {DateMethodParser} from './DateMethodParser';
import {StringMethodParser} from './StringMethodParser';
import {FallbackMethodParser} from './FallbackMethodParser';
import {hasOwnProperty} from './has-own-property';
import { PropertyIndexer } from './query';
import { instanceOf } from './instance-of';


const ExpressionTypes = {
    LogicalExpression : 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    MemberExpression: 'MemberExpression',
    MethodExpression: 'MethodExpression',
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    ExpressionStatement : 'ExpressionStatement',
    UnaryExpression:'UnaryExpression',
    FunctionExpression:'FunctionExpression',
    BlockStatement:'BlockStatement',
    ReturnStatement:'ReturnStatement',
    CallExpression:'CallExpression',
    ObjectExpression:'ObjectExpression',
    SequenceExpression:'SequenceExpression'
};

// // extend StaticMethodParser
// const properties = Object.getOwnPropertyDescriptors(MathJsMethodParser);
// Object.defineProperties(StaticMethodParser, Object.keys(properties).filter( key => {
//     return typeof properties[key].value === 'function';
// }).map( key => {
//     return properties[key];
// }));


/**
 * @class ClosureParser
 * @constructor
 */
class ClosureParser {
    namedParams: any[];
    parsers: (MathJsMethodParser | MathMethodParser | DateMethodParser | StringMethodParser | FallbackMethodParser)[];
    params: any;
    constructor() {
        /**
         * @type Array
         */
        this.namedParams = [];
        /**
         * @type {*}
         */
        this.parsers = [
            new MathJsMethodParser(),
            new MathMethodParser(),
            new DateMethodParser(),
            new StringMethodParser(),
            new FallbackMethodParser()
        ];
        this.params = null;

    }
    /**
     * Parses a javascript expression and returns the equivalent select expression.
     * @param {*} func The closure expression to parse
     * @param {*} params An object which represents closure parameters
     */
    parseSelect(func: any, params?: any) {
        if (func == null) {
            return;
        }
        this.params = params;
        Args.check(typeof func === 'function', new Error('Select closure must a function.'));
        // convert the given function to javascript expression
        const expr = parseScript('void(' + func.toString() + ')');
        // validate expression e.g. return [EXPRESSION];
        const body: any = expr.body[0];
        const funcExpr = body.expression.argument;
        // get named parameters
        this.namedParams = funcExpr.params;
        const res: PropertyIndexer = this.parseCommon(funcExpr.body);
        if (res && res instanceof SequenceExpression) {
            return res.value.map( x => {
                return x.exprOf();
            });
        }
        if (res && res instanceof MemberExpression) {
            return [ res.exprOf() ];
        }
        if (res && res instanceof ObjectExpression) {
            return Object.keys(res).map( (key: string) => {
                if (hasOwnProperty(res, key)) {
                    const result = {};
                    Object.defineProperty(result, key, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: (res as PropertyIndexer)[key].exprOf()
                    })
                    return result;
                }
            });
        }
        throw new Error('Invalid select closure');
    }

    /**
     * Parses a javascript expression and returns the equivalent QueryExpression instance.
     * @param {Function} func The closure expression to parse
     * @param {*} params An object which represents closure parameters
     */
    parseFilter(func: () => void, params?: any) {
        const self = this;
        if (func == null) {
            return;
        }
        this.params = params;
        // convert the given function to javascript expression
        const expr = parseScript('void(' + func.toString() + ')');
        // get FunctionExpression
        const body: any = expr.body[0];
        const fnExpr = body.expression.argument;
        if (fnExpr == null) {
            throw new Error('Invalid closure statement. Closure expression cannot be found.');
        }
        // get named parameters
        self.namedParams = fnExpr.params;
        // validate expression e.g. return [EXPRESSION];
        if (fnExpr.body.type === ExpressionTypes.MemberExpression) {
            return this.parseMember(fnExpr.body);
        }
        // validate expression e.g. return [EXPRESSION];
        if (fnExpr.body.body[0].type!==ExpressionTypes.ReturnStatement) {
            throw new Error('Invalid closure syntax. A closure expression must return a value.');
        }
        const closureExpr =  fnExpr.body.body[0].argument;
        // parse this expression
        const result = this.parseCommon(closureExpr);
        // and finally return the equivalent query expression
        if (result && typeof result.exprOf === 'function') {
                return result.exprOf();
        }
    }

    parseCommon(expr: any): any {
        if (expr.type === ExpressionTypes.LogicalExpression) {
            return this.parseLogical(expr);
        }
        else if (expr.type === ExpressionTypes.BinaryExpression) {
            return this.parseBinary(expr);
        }
        else if (expr.type === ExpressionTypes.Literal) {
            return this.parseLiteral(expr);
        }
        else if (expr.type === ExpressionTypes.MemberExpression) {
            return this.parseMember(expr);
        }
        else if (expr.type === ExpressionTypes.CallExpression) {
            return this.parseMethod(expr);
        }
        else if (expr.type === ExpressionTypes.Identifier) {
            return this.parseIdentifier(expr);
        }
        else if (expr.type === ExpressionTypes.BlockStatement) {
            return this.parseBlock(expr);
        }
        throw new Error(`The given expression type (${expr.type}) is invalid or it has not implemented yet.`);
    }

    /**
     * Parses an object expression e.g. { "createdAt": x.dateCreated }
     * @param {*} objectExpression
     */
    parseObject(objectExpression: any): any {
        const self =this;
        if (objectExpression == null) {
            throw new Error('Object expression may not be null');
        }
        if (objectExpression.type !== ExpressionTypes.ObjectExpression) {
            throw new Error('Invalid expression type. Expected an object expression.');
        }
        if (Array.isArray(objectExpression.properties) === false) {
            throw new Error('Object expression properties must be an array.');
        }
        const finalResult = new ObjectExpression();
        objectExpression.properties.forEach( (property: any) => {
            const value = self.parseCommon(property.value);
            let name;
            if (property.key == null) {
                throw new Error(`Property key may not be null.`);
            }
            if (property.key && property.key.type === 'Literal') {
                name = property.key.value;
            }
            else if (property.key && property.key.type === 'Identifier') {
                name = property.key.name;
            }
            else {
                throw new Error(`Invalid property key type. Expected Literal or Identifier. Found ${property.key.type}.`);
            }
            Object.defineProperty(finalResult, name, {
                value,
                enumerable: true,
                configurable: true
            });
        });
        return finalResult;
    }

    /**
     * Parses a sequence expression e.g. { x.id, x.dateCreated }
     * @param {*} sequenceExpression
     */
    parseSequence(sequenceExpression: any): any {
        const self =this;
        if (sequenceExpression == null) {
            throw new Error('Sequence expression may not be null');
        }
        if (sequenceExpression.type !== ExpressionTypes.SequenceExpression) {
            throw new Error('Invalid expression type. Expected an object expression.');
        }
        if (Array.isArray(sequenceExpression.expressions) === false) {
            throw new Error('Sequence expression expressions must be an array.');
        }
        const finalResult = new SequenceExpression();
        sequenceExpression.expressions.forEach( (expression: any) => {
            finalResult.value.push(self.parseCommon(expression));
        });
        return finalResult;
    }


    parseBlock(expr: any): any {
        const self = this;
        // get expression statement
        const bodyExpression = expr.body[0];
        if (bodyExpression.type === ExpressionTypes.ExpressionStatement) {
            if (bodyExpression.expression && bodyExpression.expression.type === 'SequenceExpression') {
                return self.parseSequence(bodyExpression.expression);
            }
            else if (bodyExpression.expression && bodyExpression.expression.type === 'MemberExpression') {
                return self.parseMember(bodyExpression.expression);
            }
        }
        else if (bodyExpression.type === ExpressionTypes.ReturnStatement) {
            // get return statement
            const objectExpression = bodyExpression.argument;
            if (objectExpression && objectExpression.type === ExpressionTypes.ObjectExpression) {
                return self.parseObject(objectExpression);
            }
        }
        throw new Error('The given expression is not yet implemented (' + expr.type + ').');
    }

    parseLogical(expr: any): any {
        const self = this;
        const op = (expr.operator === '||') ? Operators.Or : Operators.And;
        // validate operands
        if (expr.left == null || expr.right == null) {
            throw new Error('Invalid logical expression. Left or right operand is missing or undefined.');
        }
        else {
            const left = self.parseCommon(expr.left);
            const right = self.parseCommon(expr.right);
            // create expression
            return new LogicalExpression(op, [left, right]);
        }
    }

    /**
     * @static
     * @param {string} binaryOperator
     * @returns {*}
     */
    static binaryToExpressionOperator(binaryOperator: any): string {
      switch (binaryOperator) {
          case '===':
          case '==':
              return Operators.Eq;
          case '!=':
          case '!==':
              return Operators.Ne;
          case '>':
              return Operators.Gt;
          case '>=':
              return Operators.Ge;
          case '<':
              return Operators.Lt;
          case '<=':
              return Operators.Le;
          case '-':
              return Operators.Sub;
          case '+':
              return Operators.Add;
          case '*':
              return Operators.Mul;
          case '/':
              return Operators.Div;
          case '%':
              return Operators.Mod;
          case '&':
              return Operators.BitAnd;
          default:
              return;
      }
    }

    parseBinary(expr: any): any {
        const self = this;
        const op = ClosureParser.binaryToExpressionOperator(expr.operator);
        if (op == null) {
            throw new Error('Invalid binary operator.');
        }
        else {
            const left = self.parseCommon(expr.left);
            const right = self.parseCommon(expr.right);
            if (ArithmeticExpression.isArithmeticOperator(op)) {
                // validate arithmetic arguments
                if (instanceOf(left, LiteralExpression) && instanceOf(right, LiteralExpression)) {
                    // evaluate expression
                    switch (op) {
                        case Operators.Add:
                            return left.value + right.value;
                        case Operators.Sub:
                            return left.value - right.value;
                        case Operators.Div:
                            return left.value / right.value;
                        case Operators.Mul:
                            return left.value * right.value;
                        case Operators.Mod:
                            return left.value % right.value;
                        case Operators.BitAnd:
                            // tslint:disable-next-line:no-bitwise
                            return left.value & right.value;
                        default:
                            throw new Error('Invalid arithmetic operator');
                    }
                }
                else {
                    return new ArithmeticExpression(left, op, right);
                }
            }
            else if (ComparisonExpression.isComparisonOperator(op)) {
                return new ComparisonExpression(left, op, right);
            }
            else {
                throw new Error('Unsupported binary expression');
            }
        }

    }

    parseMember(expr: any): any {
        const self = this;
        if (expr.property) {
            const namedParam = self.namedParams[0];
            if (namedParam == null) {
                throw new Error('Invalid or missing closure parameter');
            }
            if (expr.object.name===namedParam.name) {
                const member = self.resolveMember(expr.property.name);
                return new MemberExpression(member);
            }
            else {
                let value;
                if (expr.object.object == null) {
                    // evaluate object member value e.g. item.title or item.status.id
                    value = memberExpressionToString(expr);
                    return new MemberExpression(value);
                }
                if (expr.object.object.name===namedParam.name) {
                    // get closure parameter expression e.g. x.title.length
                    const property = expr.property.name;
                    const result: any = self.parseMember(expr.object);
                    return new MethodCallExpression(property, [result]);
                }
                else {
                    // evaluate object member value e.g. item.title or item.status.id
                    value = memberExpressionToString(expr);
                    return new LiteralExpression(value);
                }

            }
        }
        else {
            throw new Error('Invalid member expression.');
        }
    }

    /**
     * @private
     * @param {*} expr
     */
    parseMethodCall(expr: any): any {
        const self = this;
        if (expr.callee.object == null) {
            throw new Error('Invalid or unsupported method expression.');
        }
        const method = expr.callee.property.name;
        const result = self.parseMember(expr.callee.object);
        const args = [result];
        expr.arguments.forEach( (arg: any) => {
            args.push(self.parseCommon(arg));
        });

        const createMethodCall = self.parsers.map( parser => {
                return parser.test(method);
            }).find( m => {
                return typeof m === 'function';
            });
        if (typeof createMethodCall === 'function') {
            return createMethodCall(args);
        }
        throw new Error('The specified method ('+ method +') is unsupported or is not yet implemented.');
    }

    parseMethod(expr: any): any {

        const self = this;
        let name: string;
        // if callee is a sequence expression e.g. round(x.price, 4)
        // where round is something like import { round } from 'mathjs';
        if (expr.callee && expr.callee.type === ExpressionTypes.SequenceExpression) {
            // search argument for an expression of type StaticMemberExpression
            const findExpression = expr.callee.expressions.find( (expression: any) => {
                return expression.type === ExpressionTypes.MemberExpression;
            });
            if (findExpression == null) {
                // throw error
                throw new Error('CallExpression has an invalid syntax. Expected a valid callee member expression.');
            } else {
                name = memberExpressionToString(findExpression);
            }
        }
        else {
            name = expr.callee.name;
        }
        const args: any[] = [];
        let needsEvaluation = true;
        if (name == null) {
            if (expr.callee.object != null) {
                if (expr.callee.object.object != null) {
                    if (expr.callee.object.object.name===self.namedParams[0].name) {
                        return self.parseMethodCall(expr);
                    }
                }
            }
            name = memberExpressionToString(expr.callee);
        }
        // get arguments
        expr.arguments.forEach((arg: any) => {
            const result = self.parseCommon(arg);
            args.push(result);
            if (!instanceOf(result, LiteralExpression)) {
                needsEvaluation = false;
            }
        });
        if (needsEvaluation) {
            throw new Error('Needs evaluation');
            // const fn = self.eval(name);
            // let thisArg;
            // if (thisName) {
            //     thisArg = self.eval(thisName);
            // }
            // return new LiteralExpression(fn.apply(thisArg, args.map(x => { return x.value; })));
        }
        else {
            const createMethodCall = self.parsers.map( parser => {
                return parser.test(name);
            }).find( method => {
                return typeof method === 'function';
            });
            if (typeof createMethodCall === 'function') {
                return createMethodCall(args);
            }
            else {
                return new MethodCallExpression(name, args);
            }
        }
    }

    parseIdentifier(expr: any) {
        if (this.params && Object.prototype.hasOwnProperty.call(this.params, expr.name)) {
            return new LiteralExpression(this.params[expr.name]);
        }
        throw new Error('Identifier cannot be found or is inaccessible. Consider passing parameters if they are used inside method.');
    }

    parseLiteral(expr: any) {
        return new LiteralExpression(expr.value);
    }

    /**
     * Abstract function which resolves entity based on the given member name
     * @param {string} member
     */
    resolveMember(member: string) {
        return member;
    }

    /**
     * Resolves a custom method of the given name and arguments and returns an equivalent MethodCallExpression instance.
     * @param method
     * @param args
     * @returns {MethodCallExpression}
     */
    // eslint-disable-next-line no-unused-vars
    resolveMethod(): MethodCallExpression {
        return null;
    }
}

function memberExpressionToString(expr: any): string {
    if (expr.object.object == null) {
        return expr.object.name + '.' + expr.property.name
    }
    else {
        return memberExpressionToString(expr.object) + '.' + expr.property.name;
    }
}

function parentMemberExpressionToString(expr: any): string {
    if (expr.object.object == null) {
        return expr.object.name;
    } else {
        return memberExpressionToString(expr.object);
    }
}

export {
    ClosureParser
}