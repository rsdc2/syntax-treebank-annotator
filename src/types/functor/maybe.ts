interface IMaybe<T> extends IFunctor<T>, IMonad<T>{
    _value: T | null | undefined
    applyFmap<U>(justF: Maybe<(a: T) => U>): Maybe<U> 
    applyBind<U>(justF: Maybe<(a: T) => Maybe<U>>): Maybe<U> 
    fmap<U>(f: (a: T | null | undefined) => U): Maybe<U>
    fmapDefault<U>(def:Maybe<U>, f: (a: T | null | undefined) => U): Maybe<U>
    fmapErr<U>(message:string, f: (a: T | null | undefined) => U): Maybe<U>
    bind<U>(f: (a: T | null | undefined) => Maybe<U>): Maybe<U>
    bindErr<U>(message:string, f: (a: T | null | undefined) => Maybe<U>): Maybe<U>
    flatMap<U>(f: (a: T | null | undefined) => Maybe<U>): Maybe<U>
    flatMapArr<U>(f: (a: T | null | undefined) => Maybe<Array<U>>): Array<U>
    return(a: T): Maybe<T>
    unpack<U>(def: T | U): T | U
    fromMaybe(def: T): T
    fromMaybeThrow():T
    eq(x: T): boolean
    isNothing: boolean
    isSomething: boolean
    get value(): T | null 
}


class Just<T> implements IMaybe<T> {

    _value: T 

    constructor(value: T ) {
        this._value = value
    }

    applyFmap<U>(maybeF: Maybe<(a: T) => U>): Maybe<U> {
        if (maybeF._value === null) {
            return new Nothing<U>()
        }

        return MaybeT.of(maybeF._value(this._value))
    }

    applyBind<U>(maybeF: Maybe<(a: T) => Maybe<U>>): Maybe<U> {
        if (maybeF._value === null) {
            return new Nothing<U>()
        }

        return maybeF._value(this._value)
    }

    bind<U>(f: (a: T) => Maybe<U>): Maybe<U> {
        return f(this._value)
    }

    bindErr<U>(message:string, f: (a: T) => Maybe<U>): Maybe<U> {
        return f(this._value)
    }

    eq(x: T) {
        return this._value === x
    }

    fmap<U>(f: (a: T) => U): Maybe<U> {
        return MaybeT.of<U>(f(this._value))
    }

    fmapErr <U>(message: string, f: (a: T) => U): Maybe<U> {
        return MaybeT.of<U>(f(this._value))
    }

    fmapDefault <U>(def: Maybe<U>, f: (a: T) => U): Maybe<U> {
        return MaybeT.of<U>(f(this._value))
    }
    // fmapArr<U>(f: (a: T) => Array<U>): Array<U> {
    //     return f(this._value).unpackT([])
    // }

    flatMap<U>(f: (a: T) => Maybe<U>): Maybe<U> {
        return f(this._value)
    }

    flatMapArr<U>(f: (a: T) => Maybe<Array<U>>): Array<U> {
        return f(this._value).fromMaybe([])
    }

    get isNothing() {
        return false
    }

    get isSomething() {
        return true
    }

    return(a: T): Maybe<T> {
        return new Just(a)
    }

    static of<T>(val: T) {
        return new Just<T>(val)
    }

    unpack<U>(def: T | U): T | U {
        return this._value
    }

    fromMaybe(def: T): T {
        return this._value
    }

    fromMaybeThrow(): T {
        return this._value
    }

    get value() {
        return this._value
    }
    
}


class Nothing<T> implements IMaybe<T> {
    _value: null

    constructor() {
        this._value = null
    }

    applyFmap<U>(justF: Maybe<(a: T) => U>): Maybe<U> {
        return new Nothing<U>()
    }

    applyBind<U>(justF: Maybe<(a: T) => Maybe<U>>): Maybe<U> {
        return new Nothing<U>()
    }

    bind<U>(f: (a:T) => Maybe<U>): Maybe<U> {
        return new Nothing<U>()
    }

    bindErr<U>(message: string, f: (a:T) => Maybe<U>): Maybe<U> {
        console.error(message)
        return new Nothing<U>()
    }

    eq(x: T) {
        return this._value == x
    }

    fmap<U>(f: (a:T) => U): Maybe<U> {
        return new Nothing<U>()
    }

    fmapDefault<U>(def:Maybe<U>, f: (a: T) => U): Maybe<U>{
        return def
    }


    fmapErr<U>(message:string, f: (a: T) => U): Maybe<U>{
        console.error(message)
        return new Nothing<U>()
    }

    flatMap<U>(f: (a:T) => Maybe<U>): Maybe<U> {
        return new Nothing<U>()
    }

    flatMapArr<U>(f: (a:T) => Maybe<Array<U>>): Array<U> {
        return new Array<U>()
    }

    get isNothing () {
        return true
    }

    get isSomething() {
        return false
    }

    static of<T>() {
        return new Nothing<T>()
    }

    return<U>(): Maybe<U> {
        return new Nothing<U>()
    }

    unpack<U>(def: T | U): T | U {
        return def
    }

    fromMaybe(def: T): T {
        return def
    }

    fromMaybeThrow(): T {
        throw "Value cannot be Nothing."
    }

    get value() {
        return null
    }
}

class MaybeT {

    static comp = (x: Maybe<number>) => (f: (a: number) => (b: number) => boolean) => (y: Maybe<number>) =>  {
        return y.applyFmap(x.fmap(f)).fromMaybe(false)
    }

    static isNearest = (direction: Dir) => (x: Maybe<number>) => (y: Maybe<number>[]) => {
        return y.every( (item: Maybe<number> ) => {
            return MaybeT.isNearer (direction) (x) (item)
        })
    }

    static isNearer = (direction: Dir) => (x: Maybe<number>) => (y: Maybe<number>) => {
        switch (direction) {
            case Dir.Left: {
                if (x.value === null && y.value === null) {
                    return false
                } else if (x.value !== null && y.value === null) {
                    return true
                } else if (x.value === null && y.value !== null) {
                    return false
                } else if (x.value !== null && y.value !== null && x.value > y.value) {
                    return true
                }
                return false
        
            }
            case Dir.Right: {
                if (x.value === null && y.value === null) {
                    return false
                } else if (x.value !== null && y.value === null) {
                    return true
                } else if (x.value === null && y.value !== null) {
                    return false
                } else if (x.value !== null && y.value !== null && x.value < y.value) {
                    return true
                }
                return false
        
            }
        }
    }

    static isSomething = <T>(maybe: Maybe<T>) => {
        return maybe.isSomething
    }

    static of<T>(val: T | null | undefined): Maybe<T> {
        if (val === null || val === undefined) {
            return new Nothing<T>()
        } else {
            return new Just<T>(val)
        }        
    }

    static ofThrow<T>(message:string, val: T | null | undefined): Maybe<T> {
        if (val === null || val === undefined) {
            console.error(message)
            return new Nothing<T>()
        } else {
            return new Just<T>(val)
        }        
    }

    static ofNonNeg(val: number): Maybe<number> {
        if (val === -1) {
            return new Nothing<number>()
        } else {
            return new Just<number>(val)
        }        
    }

    static toList<T>(val: Maybe<Array<T>>): T[] {
        return val.fromMaybe([])
    }
}


type Maybe<T> = Just<T> | Nothing<T>   // cf. Haskell definition of Maybe

