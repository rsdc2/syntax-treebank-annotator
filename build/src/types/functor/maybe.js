class Just {
    constructor(value) {
        this._value = value;
    }
    applyFmap(maybeF) {
        if (maybeF._value === null) {
            return new Nothing();
        }
        return MaybeT.of(maybeF._value(this._value));
    }
    applyBind(maybeF) {
        if (maybeF._value === null) {
            return new Nothing();
        }
        return maybeF._value(this._value);
    }
    bind(f) {
        return f(this._value);
    }
    bindErr(message, f) {
        return f(this._value);
    }
    eq(x) {
        return this._value === x;
    }
    fmap(f) {
        return MaybeT.of(f(this._value));
    }
    fmapErr(message, f) {
        return MaybeT.of(f(this._value));
    }
    fmapDefault(def, f) {
        return MaybeT.of(f(this._value));
    }
    // fmapArr<U>(f: (a: T) => Array<U>): Array<U> {
    //     return f(this._value).unpackT([])
    // }
    flatMap(f) {
        return f(this._value);
    }
    flatMapArr(f) {
        return f(this._value).unpackT([]);
    }
    get isNothing() {
        return false;
    }
    get isSomething() {
        return true;
    }
    return(a) {
        return new Just(a);
    }
    static of(val) {
        return new Just(val);
    }
    unpack(def) {
        return this._value;
    }
    unpackT(def) {
        return this._value;
    }
    get value() {
        return this._value;
    }
}
class Nothing {
    constructor() {
        this._value = null;
    }
    applyFmap(justF) {
        return new Nothing();
    }
    applyBind(justF) {
        return new Nothing();
    }
    bind(f) {
        return new Nothing();
    }
    bindErr(message, f) {
        console.error(message);
        return new Nothing();
    }
    eq(x) {
        return this._value == x;
    }
    fmap(f) {
        return new Nothing();
    }
    fmapDefault(def, f) {
        return def;
    }
    fmapErr(message, f) {
        console.error(message);
        return new Nothing();
    }
    flatMap(f) {
        return new Nothing();
    }
    flatMapArr(f) {
        return new Array();
    }
    get isNothing() {
        return true;
    }
    get isSomething() {
        return false;
    }
    static of() {
        return new Nothing();
    }
    return() {
        return new Nothing();
    }
    unpack(def) {
        return def;
    }
    unpackT(def) {
        return def;
    }
    get value() {
        return null;
    }
}
class MaybeT {
    static of(val) {
        if (val === null || val === undefined) {
            return new Nothing();
        }
        else {
            return new Just(val);
        }
    }
    static ofThrow(message, val) {
        if (val === null || val === undefined) {
            console.error(message);
            return new Nothing();
        }
        else {
            return new Just(val);
        }
    }
    static ofNonNeg(val) {
        if (val === -1) {
            return new Nothing();
        }
        else {
            return new Just(val);
        }
    }
    static toList(val) {
        return val.unpackT([]);
    }
}
MaybeT.comp = (x) => (f) => (y) => {
    return y.applyFmap(x.fmap(f)).unpackT(false);
};
MaybeT.isNearest = (direction) => (x) => (y) => {
    return y.every((item) => {
        return MaybeT.isNearer(direction)(x)(item);
    });
};
MaybeT.isNearer = (direction) => (x) => (y) => {
    switch (direction) {
        case Dir.Left: {
            if (x.value === null && y.value === null) {
                return false;
            }
            else if (x.value !== null && y.value === null) {
                return true;
            }
            else if (x.value === null && y.value !== null) {
                return false;
            }
            else if (x.value !== null && y.value !== null && x.value > y.value) {
                return true;
            }
            return false;
        }
        case Dir.Right: {
            if (x.value === null && y.value === null) {
                return false;
            }
            else if (x.value !== null && y.value === null) {
                return true;
            }
            else if (x.value === null && y.value !== null) {
                return false;
            }
            else if (x.value !== null && y.value !== null && x.value < y.value) {
                return true;
            }
            return false;
        }
    }
};
