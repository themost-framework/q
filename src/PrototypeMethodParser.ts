// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

class PrototypeMethodParser {

     test(name: string) {
        if (name === 'toString') {
            return;
        }
        if (typeof (<any>this)[name] === 'function') {
            return (<any>this)[name];
        }
    }
 }

 export {
    PrototypeMethodParser
 };