function fmap<T, U>(f: (a: T) => U): (a: IFunctor<T>) => IFunctor<U> {

    function _fmap(a: IFunctor<T>): IFunctor<U> {
        return a.fmap(f)
    }
    return _fmap
}

const ident = <T>(a: T) => {
    return a
}

const identMaybe = <T>(a: T) => {
    return MaybeT.of(a)
}

function bind<T, U>(f: (a: T) => IMonad<U>): (a: IMonad<T>) => IMonad<U> {

    function _bind(a: IMonad<T>): IMonad<U> {
        return a.bind(f)
    }
    return _bind
}

function handleMinus<T>(a: Array<T>, n: number): number {
    switch (n < 0) {
        case true: {
            return a.length + n
        }
        case false: {
            return n
        }
    }
}

function getNth<T>(a: Array<T>, n: number): Maybe<T> {
    try {
        return MaybeT.of(a[handleMinus(a, n)])
    }
    catch (err) {
        return new Nothing<T>()
    }
}


function head<T>(a: Array<T>): Maybe<T> {
    return getNth(a, 0)
}

function last<T>(a: Array<T>): Maybe<T> {
    return getNth(a, -1)
}

function tail<T>(a: Array<T>): T[] {
    if (a.length === 0) {
        return []

    } else if (a.length === 1) {
        return [a[0]]

    } else {
        return a.slice(1)
    }
}


function map<T, U>(f: (a: T) => U): (a: T[]) => U[] {

    function _map(a: T[]): U[] {
        return a.map(f)
    }
    return _map
}

function filter<T>(f: (a: T) => boolean) {
    function _filter(a: T[]) {
        return a.filter(f)
    }
    return _filter
}

function match(regexp: string) {
    function _match(s: string) {
        return MaybeT.of(s.match(regexp))
    }
    return _match
}

function matchFilter(regexp: string | RegExp) {
    function _match(s: string) {
        return s.match(regexp) !== null
    }
    return _match
}



function maybe<T>(defaultVal: T) {

    function _maybe(val: Maybe<T>): T {
        if (val.value === null || val.value === undefined) {
            return defaultVal
        } else {
            return val.value
        }
    }

    return _maybe
}

function mult(x: number) {
    function _mult(y: number) {
        return x * y
    }
    return _mult
}


const flip = <T, U, V>(f: (a: T) => (b: U) => V) => (y: U) => (x: T) => {
    return f(x)(y)
}

const flip_1_to_3 = <T, U, V, W>(f: (a: T) => (b: U) => (c: V) => W) => (y: U) => (z: V) => (x: T) => {
    return f(x)(y)(z)
}

const flip_2_to_3 = <T, U, V, W>(f: (a: T) => (b: U) => (c: V) => W) => (x: T) => (z: V) => (y: U) => {
    return f(x)(y)(z)
}


const apply = <T, U>(f: (a: T) => U) => (x: T) => {
    return f(x)
}

const $$ = apply