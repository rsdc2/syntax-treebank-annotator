// For implementing monads in TypeScript, cf:
// https://jrsinclair.com/articles/2016/marvellously-mysterious-javascript-maybe-monad/
// https://codewithstyle.info/advanced-functional-programming-in-typescript-maybe-monad/
// http://learnyouahaskell.com/

interface IMonad<T> extends IFunctor<T> {
    _value: T | null | undefined
    bind<U>(f: (a: T | null | undefined) => IMonad<U>): IMonad<U>
    return(a: T): IMonad<T>
    get value(): T | null | undefined
}