// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {MethodCallExpression} from './expressions';
import {PrototypeMethodParser} from './PrototypeMethodParser';
/**
 * @class
 */
class DateMethodParser extends PrototypeMethodParser {
    constructor() {
        super();
    }

    getFullYear(args: any[]): MethodCallExpression {
        return new MethodCallExpression('year', args);
    }

    getYear(args: any[]): MethodCallExpression {
        return new MethodCallExpression('year', args);
    }

    getMonth(args: any[]): MethodCallExpression {
        return new MethodCallExpression('month', args);
    }

    getDate(args: any[]): MethodCallExpression {
        return new MethodCallExpression('dayOfMonth', args);
    }

    toDate(args: any[]): MethodCallExpression {
        return new MethodCallExpression('date', args);
    }

    getHours(args: any[]): MethodCallExpression {
        return new MethodCallExpression('hour', args);
    }

    getMinutes(args: any[]): MethodCallExpression {
        return new MethodCallExpression('minute', args);
    }

    getSeconds(args: any[]): MethodCallExpression {
        return new MethodCallExpression('second', args);
    }

}
export {
    DateMethodParser
}