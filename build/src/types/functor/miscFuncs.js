function fmap(f) {
    function _fmap(a) {
        return a.fmap(f);
    }
    return _fmap;
}
const ident = (a) => {
    return a;
};
const identMaybe = (a) => {
    return MaybeT.of(a);
};
function bind(f) {
    function _bind(a) {
        return a.bind(f);
    }
    return _bind;
}
function handleMinus(a, n) {
    switch (n < 0) {
        case true: {
            return a.length + n;
        }
        case false: {
            return n;
        }
    }
}
function getNth(a, n) {
    try {
        return MaybeT.of(a[handleMinus(a, n)]);
    }
    catch (err) {
        return new Nothing();
    }
}
// function head<T>(a: Array<T>): Maybe<T> {
//     return getNth(a, 0)
// }
function tail(a) {
    if (a.length === 0) {
        return [];
    }
    else if (a.length === 1) {
        return [a[0]];
    }
    else {
        return a.slice(1);
    }
}
function map(f) {
    function _map(a) {
        return a.map(f);
    }
    return _map;
}
function filter(f) {
    function _filter(a) {
        return a.filter(f);
    }
    return _filter;
}
function match(regexp) {
    function _match(s) {
        return MaybeT.of(s.match(regexp));
    }
    return _match;
}
function matchFilter(regexp) {
    function _match(s) {
        return s.match(regexp) !== null;
    }
    return _match;
}
function maybe(defaultVal) {
    function _maybe(val) {
        if (val.value === null || val.value === undefined) {
            return defaultVal;
        }
        else {
            return val.value;
        }
    }
    return _maybe;
}
const flip = (f) => (y) => (x) => {
    return f(x)(y);
};
const flip_1_to_3 = (f) => (y) => (z) => (x) => {
    return f(x)(y)(z);
};
const flip_2_to_3 = (f) => (x) => (z) => (y) => {
    return f(x)(y)(z);
};
const apply = (f) => (x) => {
    return f(x);
};
const $$ = apply;
