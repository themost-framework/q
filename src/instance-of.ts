// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
function instanceOf(obj: any, ctor: any): boolean {
    // validate constructor
    if (typeof ctor !== 'function') {
        return false
    }
    // validate with instanceof
    if (obj instanceof ctor) {
        return true;
    }
    return !!(obj && obj.constructor && obj.constructor.name === ctor.name);
}

export {
    instanceOf
};

