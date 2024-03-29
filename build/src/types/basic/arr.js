class ArrMaybe {
    _array;
    constructor(array) {
        const arr = array;
    }
    get array() {
        return this._array;
    }
    bind(f) {
        return new ArrMaybe([...this._array].map((value) => value.bind(f)));
    }
    fmap(f) {
        return new ArrMaybe([...this._array].map((value) => value.fmap(f)));
    }
    filter(f) {
        return new ArrMaybe([...this._array].filter(f));
    }
    defaultT(defaultVal) {
        return [...this._array].map((value) => value.value !== null && value.value !== undefined ? value.value : defaultVal);
    }
    static of = (array) => {
        return new ArrMaybe(array.map(MaybeT.of));
    };
    removeNothings = () => {
        return Arr.removeNothings(this._array);
    };
}
class Arr {
    static arrify = (item) => {
        return [item];
    };
    static byIdx(idx) {
        function _byIdx(array) {
            return MaybeT.of(array[idx]);
        }
        return _byIdx;
    }
    static concat = (_array1) => (_array2) => {
        return _array1.concat(_array2);
    };
    static concatMaybe(array2) {
        function _concat(array1) {
            const reduceFunc = (acc, array2Item) => {
                return array2Item
                    .fmap(Arr.arrify)
                    .fromMaybe([])
                    .concat(acc);
            };
            return array2.reduce(reduceFunc, array1);
        }
        return _concat;
    }
    static len(array) {
        return array.length;
    }
    static push = (item) => (array) => {
        const _array = [...array];
        _array.push(item);
        return _array;
    };
    static range(start, end) {
        const _start = start < end ? start : end;
        const _end = start < end ? end : start;
        const op = start < end ? Num.add : Num.minus;
        const length = _end - _start;
        if (length > 0) {
            const array = [...Array(length).keys()];
            return array.map((x) => op(start)(x));
        }
        return [];
    }
    static head(array) {
        const length = array.length;
        if (length > 0) {
            return MaybeT.of(array[0]);
        }
        return Nothing.of();
    }
    static fromIterable(iterable) {
        return [...iterable];
    }
    static last(array) {
        const length = array.length;
        if (length > 0) {
            return MaybeT.of(array[length - 1]);
        }
        return Nothing.of();
    }
    static removeByIdx = (array) => (idx) => {
        return apply(MaybeT.of)(array.reduce((acc, item, _idx) => {
            if (_idx !== idx) {
                return Arr.push(item)(acc);
            }
            return acc;
        }, new Array))
            .fromMaybe(array);
    };
    static removeNothingReduce = (acc, item) => {
        if (item.value !== null) {
            acc.push(item.value);
            return acc;
        }
        else {
            return acc;
        }
    };
    static removeNothings = (array) => {
        return array.reduce(Arr.removeNothingReduce, new Array);
    };
    static removeEmptyStrsReduce = (acc, item) => {
        if (item !== "") {
            acc.push(item);
            return acc;
        }
        else {
            return acc;
        }
    };
    static removeEmptyStrs = (array) => {
        return array.reduce(Arr.removeEmptyStrsReduce, new Array);
    };
    static removeByItem = (array) => (item) => {
        return array.reduce((acc, _item) => {
            if (_item !== item) {
                return Arr.push(item)(acc);
            }
        }, new Array);
    };
    static replaceByIdx = (array) => (newItem) => (idx) => {
        return apply(MaybeT.of)(array.reduce((acc, item, _idx) => {
            if (_idx !== idx) {
                return Arr.push(item)(acc);
            }
            return Arr.push(newItem)(acc);
        }, new Array))
            .fromMaybe(array);
    };
    static reverse = (array) => {
        const copy = [...array];
        return copy.reverse();
    };
    static slice = (start) => (end) => (array) => {
        const arrayCopy = [...array];
        return arrayCopy.slice(start, end);
    };
    static arrFunc(funcName, arr, newElem) {
        const newArr = [...arr];
        newArr[funcName](newElem);
        return newArr;
    }
    static unshift(arr, newElem) {
        return Arr.arrFunc(ArrayFunc.Unshift, arr, newElem);
    }
}
