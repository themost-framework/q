// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

class Token {

    public type: string;
    public syntax?: string;

    static get TokenType() {
        return {
            Literal: 'Literal',
            Identifier: 'Identifier',
            Syntax: 'Syntax'
        };
    }
    static get Operator() {
        return {
            Not: '$not',
            Mul: '$mul',
            Div: '$div',
            Mod: '$mod',
            Add: '$add',
            Sub: '$sub',
            Lt: '$lt',
            Gt: '$gt',
            Le: '$lte',
            Ge: '$gte',
            Eq: '$eq',
            Ne: '$ne',
            In: '$in',
            NotIn: '$nin',
            And: '$and',
            Or: '$or'
        };
    }

    constructor(tokenType: string) {
        this.type = tokenType;
    }

    isParenOpen(): boolean {
        return (this.type === 'Syntax') && (this.syntax === '(');
    }

    isParenClose(): boolean {
        return (this.type === 'Syntax') && (this.syntax === ')');
    }

    isSlash() {
        return (this.type === 'Syntax') && (this.syntax === '/');
    }

    isComma(): boolean {
        return (this.type === 'Syntax') && (this.syntax === ',');
    }

    isNegative(): boolean {
        return (this.type === 'Syntax') && (this.syntax === '-');
    }
}

export {
    Token
};