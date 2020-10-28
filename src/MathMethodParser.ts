// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {MethodCallExpression} from "./expressions";
import { PropertyIndexer } from "./query";

/**
 * @class
 */
class MathMethodParser {

    public prefix: any[];
    constructor() {
        this.prefix = [ new RegExp(`^Math\\.(\\w+)`, 'g') ];
    }

    test(name: string): any {
        const findPrefix = this.prefix.find( prefix => {
            return prefix.test(name);
        });
        if (findPrefix) {
            const method = name.replace(findPrefix, '$1');
            const staticIndexer: PropertyIndexer = MathMethodParser;
            if (typeof staticIndexer[method] === 'function') {
                return staticIndexer[method];
            }
        }
    }

    static floor(args: any[]): MethodCallExpression {
        return new MethodCallExpression('floor', args);
    }
    static ceil(args: any[]): MethodCallExpression {
        return new MethodCallExpression('ceil', args);
    }
    static round(args: any[]): MethodCallExpression {
        return new MethodCallExpression('round', args);
    }
    static min(args: any[]): MethodCallExpression {
        return new MethodCallExpression('min', args);
    }
    static max(args: any[]): MethodCallExpression {
        return new MethodCallExpression('max', args);
    }
}

export {
    MathMethodParser
};