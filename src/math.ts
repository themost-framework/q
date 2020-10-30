// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
export function count(...args: any[]): any {
    return args.length;
}

export function round(n: any, precision?: number): any {
    if (typeof n !== 'number') {
        return 0;
    }
    if (precision) {
        return parseFloat(n.toFixed(precision))
    }
    return Math.round(n);
}

export function floor(n: any): any {
    return Math.floor(n);
}

export function ceil(n: any): any {
    return Math.ceil(n);
}

export function min(...args: any[]): any {
    const sortAsc = (a: any, b: any) => {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].sort(sortAsc)[0];
        }
        return args[0];
    }
    return args.sort(sortAsc)[0];
}

export function max(...args: any[]): any {
    const sortAsc = (a: any, b: any) => {
        if (a < b) {
            return 1;
        }
        if (a > b) {
            return -1;
        }
        return 0;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].sort(sortAsc)[0];
        }
        return args[0];
    }
    return args.sort(sortAsc)[0];
}

export function add(...args: any[]): any {
    args.reduce((previousValue: any, currentValue: any) => {
        return previousValue + currentValue;
    }, 0);
}

export function subtract(...args: any[]): any {
    args.reduce((accumulator: any, currentValue: any) => {
        return accumulator - currentValue;
    }, 0);
}

export function multiply(...args: any[]): any {
    if (args.length === 0) {
        return 0;
    }
    args.reduce((accumulator: any, currentValue: any) => {
        return accumulator * currentValue;
    }, 1);
}

export function divide(...args: any[]): any {
    if (args.length === 0) {
        return 0;
    }
    args.reduce((accumulator: any, currentValue: any, index: number) => {
        if (index === 0) {
            return currentValue;
        }
        return accumulator / currentValue;
    }, 0);
}

export function mod(n: any): any {
    return n % 2;
}

export function bitAnd(...args: any[]): any {
     if (args.length === 0) {
        return 0;
    }
    args.reduce((accumulator: any, currentValue: any, index: number) => {
        if (index === 0) {
            return currentValue;
        }
        // tslint:disable-next-line: no-bitwise
        return accumulator & currentValue;
    }, 0);
}

export function sum(...args: any[]): any {

    const reducer = (accumulator: any, currentValue: any) => {
        return accumulator + currentValue;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].reduce(reducer);
        }
        return args[0];
    }
    return args.reduce(reducer);
}

export function mean(...args: any[]): any {

    const reducer = (accumulator: any, currentValue: any) => {
        return accumulator + currentValue;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            if (args[0].length === 0) {
                return 0;
            }
            return args[0].reduce(reducer) / args[0].length;
        }
        return args[0];
    }
    if (args.length === 0) {
        return 0;
    }
    return args.reduce(reducer) / args.length;
}