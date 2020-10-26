// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved 
import {Token} from "./Token";

class IdentifierToken extends Token {

    public identifier: string;

    constructor(name: string) {
        super(Token.TokenType.Identifier);
        this.identifier = name;
    }

    valueOf() {
        return this.identifier;
    }
}
export {
    IdentifierToken
};
