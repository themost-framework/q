// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {MethodCallExpression} from './expressions';
import {parseScript} from 'esprima';
import {floor} from 'mathjs';
import { PropertyIndexer } from './query';

/**
 *
 */
class MathJsMethodParser {

    public prefix: any[];
    constructor() {
        // test mathjs
        const func1 = () => {
            return floor(1);
        };
        const expr = parseScript(`void(${func1.toString()})`);
        // get method call to find out name of mathjs
        const body = expr.body[0] as any;
        const identifier = body.expression.argument.body.body[0].argument.callee;
        this.prefix = [];
        if (Array.isArray(identifier.expressions)) {
            const callee = identifier.expressions[1];
            this.prefix.push(new RegExp(`^${callee.object.name}\\.(\\w+)`, 'g'));
        }
        // add mathjs prefix
        this.prefix.push(new RegExp(`^mathjs\\.(\\w+)`, 'g'));
    }

    test(name: string): any {
        const findPrefix = this.prefix.find( prefix => {
            return prefix.test(name);
        });
        if (findPrefix) {
            const staticIndexer: PropertyIndexer = MathJsMethodParser;
            const method = name.replace(findPrefix, '$1');
            if (typeof staticIndexer[method] === 'function') {
                return staticIndexer[method];
            }
        }
    }

    static round(args: any[]): MethodCallExpression {
        return new MethodCallExpression('round', args);
    }

    static floor(args: any[]): MethodCallExpression {
        return new MethodCallExpression('floor', args);
    }

    static ceil(args: any[]): MethodCallExpression {
        return new MethodCallExpression('ceil', args);
    }

    static mod(args: any[]): MethodCallExpression {
        return new MethodCallExpression('mod', args);
    }

    static add(args: any[]): MethodCallExpression {
        return new MethodCallExpression('add', args);
    }

    static subtract(args: any[]): MethodCallExpression {
        return new MethodCallExpression('subtract', args);
    }

    static multiply(args: any[]): MethodCallExpression {
        return new MethodCallExpression('multiply', args);
    }

    static divide(args: any[]): MethodCallExpression {
        return new MethodCallExpression('divide', args);
    }

    static bitAnd(args: any[]): MethodCallExpression {
        return new MethodCallExpression('bit', args);
    }
    static mean(args: any[]): MethodCallExpression {
        return new MethodCallExpression('avg', args);
    }
    static sum(args: any[]): MethodCallExpression {
        return new MethodCallExpression('sum', args);
    }
    static min(args: any[]): MethodCallExpression {
        return new MethodCallExpression('min', args);
    }
    static max(args: any[]): MethodCallExpression {
        return new MethodCallExpression('max', args);
    }
}

export {
    MathJsMethodParser
};
