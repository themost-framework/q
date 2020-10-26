// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
function instanceOf(any: any, ctor: Function): boolean {
    // validate constructor
    if (typeof ctor !== 'function') {
        return false
    }
    // validate with instanceof
    if (any instanceof ctor) {
        return true;
    }
    return !!(any && any.constructor && any.constructor.name === ctor.name);
}

export {
    instanceOf
};

