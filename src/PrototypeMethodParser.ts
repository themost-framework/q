import { PropertyIndexer } from "./query";

// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

class PrototypeMethodParser {

     test(name: string) {
        if (name === 'toString') {
            return;
        }
        const thisArg: PropertyIndexer = this;
        if (typeof thisArg[name] === 'function') {
            return thisArg[name];
        }
    }
 }

 export {
    PrototypeMethodParser
 };