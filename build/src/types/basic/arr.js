class Arr {
    static byIdx(idx) {
        function _byIdx(array) {
            return MaybeT.of(array[idx]);
        }
        return _byIdx;
    }
    static concatMaybe(array2) {
        function _concat(array1) {
            const reduceFunc = (acc, array2Item) => {
                return array2Item
                    .fmap(Arr.arrify)
                    .unpackT([])
                    .concat(acc);
            };
            return array2.reduce(reduceFunc, array1);
        }
        return _concat;
    }
    static len(array) {
        return array.length;
    }
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
    static last(array) {
        const length = array.length;
        if (length > 0) {
            return MaybeT.of(array[length - 1]);
        }
        return Nothing.of();
    }
    static arrFunc(funcName, arr, newElem) {
        const newArr = [...arr];
        newArr[funcName](newElem);
        return newArr;
    }
    static unshift(arr, newElem) {
        return Arr.arrFunc(ArrayFunc.Unshift, arr, newElem);
    }
}
Arr.arrify = (item) => {
    return [item];
};
Arr.concat = (_array1) => (_array2) => {
    return _array1.concat(_array2);
};
Arr.push = (item) => (array) => {
    const _array = [...array];
    _array.push(item);
    return _array;
};
Arr.removeByIdx = (array) => (idx) => {
    return $$(MaybeT.of)(array.reduce((acc, item, _idx) => {
        if (_idx !== idx) {
            return Arr.push(item)(acc);
        }
        return acc;
    }, new Array))
        .unpackT(array);
};
Arr.removeNothingReduce = (acc, item) => {
    if (item.value !== null) {
        acc.push(item.value);
        return acc;
    }
    else {
        return acc;
    }
};
Arr.removeNothings = (array) => {
    return array.reduce(Arr.removeNothingReduce, new Array);
};
Arr.removeEmptyStrsReduce = (acc, item) => {
    if (item !== "") {
        acc.push(item);
        return acc;
    }
    else {
        return acc;
    }
};
Arr.removeEmptyStrs = (array) => {
    return array.reduce(Arr.removeEmptyStrsReduce, new Array);
};
Arr.removeByItem = (array) => (item) => {
    return array.reduce((acc, _item) => {
        if (_item !== item) {
            return Arr.push(item)(acc);
        }
    }, new Array);
};
Arr.replaceByIdx = (array) => (newItem) => (idx) => {
    return $$(MaybeT.of)(array.reduce((acc, item, _idx) => {
        if (_idx !== idx) {
            return Arr.push(item)(acc);
        }
        return Arr.push(newItem)(acc);
    }, new Array))
        .unpackT(array);
};
Arr.reverse = (array) => {
    const copy = [...array];
    return copy.reverse();
};
Arr.slice = (start) => (end) => (array) => {
    const arrayCopy = [...array];
    return arrayCopy.slice(start, end);
};
