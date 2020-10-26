// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

import {MethodCallExpression} from './expressions';
import {PrototypeMethodParser} from './PrototypeMethodParser';
/**
 * @class
 */
class StringMethodParser extends PrototypeMethodParser {
    constructor() {
        super();
    }

    startsWith(args: any[]): MethodCallExpression {
        return new MethodCallExpression('startsWith', args);
    }

    endsWith(args: any[]): MethodCallExpression {
        return new MethodCallExpression('endsWith', args);
    }

    toLowerCase(args: any[]): MethodCallExpression {
        return new MethodCallExpression('toLower', args);
    }

    toLocaleLowerCase(args: any[]): MethodCallExpression {
        return new MethodCallExpression('toLower', args);
    }

    toUpperCase(args: any[]): MethodCallExpression {
        return new MethodCallExpression('toUpper', args);
    }

    toLocaleUpperCase(args: any[]): MethodCallExpression {
        return new MethodCallExpression('toUpper', args);
    }

    indexOf(args: any[]): MethodCallExpression {
        return new MethodCallExpression('indexOfBytes', args);
    }

    substr(args: any[]): MethodCallExpression {
        return new MethodCallExpression('substr', args);
    }

    substring(args: any[]): MethodCallExpression {
        return new MethodCallExpression('substr', args);
    }

    trim(args: any[]): MethodCallExpression {
        return new MethodCallExpression('trim', args);
    }

    concat(args: any[]): MethodCallExpression {
        return new MethodCallExpression('concat', args);
    }

    includes(args: any[]): MethodCallExpression {
        return new MethodCallExpression('contains', args);
    }
}

export {
    StringMethodParser
};
