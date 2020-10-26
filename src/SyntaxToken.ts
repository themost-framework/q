// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

import {Token} from './Token';
/**
 * @class
 * @param {String} chr
 * @constructor
 */
class SyntaxToken extends Token {

    static get ParenOpen() {
        return new SyntaxToken('(');
    }

    static get ParenClose() {
        return new SyntaxToken(')');
    }

    static get Slash() {
        return new SyntaxToken('/');
    }

    static get Comma() {
        return new SyntaxToken(',');
    }
    
    static get Negative() {
        return new SyntaxToken('-');
    }
    
    constructor(chr: string) {
        super(Token.TokenType.Syntax);
        this.syntax = chr;
    }

    valueOf() {
        return this.syntax;
    }
}

export {
    SyntaxToken
};