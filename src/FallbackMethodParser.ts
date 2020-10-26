// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {MethodCallExpression} from './expressions';
import { PropertyIndexer } from './query';

class FallbackMethodParser {
    test(name: string): any {
        const matches = /\.(\w+)$/.exec(name);
        if (matches == null) {
            return;
        }
        const method = matches[1];
        const staticIndexer = <PropertyIndexer>FallbackMethodParser;
        if (typeof staticIndexer[method] === 'function') {
            return staticIndexer[method];
        }
    }
    static count(args: any[]): MethodCallExpression {
        return new MethodCallExpression('count', args);
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
    FallbackMethodParser
}