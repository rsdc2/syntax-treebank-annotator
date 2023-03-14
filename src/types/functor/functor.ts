interface IFunctor<T> {
    _value: T | null | undefined
    fmap<U>(f: (a: T | null | undefined) => U): IFunctor<U>
    get value(): T | null | undefined
}
