class Arr {
    static arrify = <T>(item: T) => {
        return [item]
    }

    static byIdx<T> (idx: number) {
        function _byIdx (array: T[]) {
            return MaybeT.of<T>(array[idx])
        }    
        return _byIdx
    }   

    static concat = <T>(_array1: T[]) => (_array2: T[]) => {
        return _array1.concat(_array2)
    }

    static concatMaybe<T>(array2: Maybe<T>[]) {

        function _concat(array1: T[]) {
            
            const reduceFunc = (acc: T[], array2Item: Maybe<T>) => {
                return array2Item
                    .fmap(Arr.arrify)
                    .unpackT([])
                    .concat(acc)
                } 

            return array2.reduce(reduceFunc, array1)
        }
        return _concat
    }



    static len<T>(array: Array<T>) {
        return array.length
    }

    static push = <T>(item: T) => (array: Array<T>) => {
        const _array = [...array]
        _array.push(item)
        return _array
    }

    static range(start: number, end: number) {
        const _start = start < end ? start : end
        const _end = start < end ? end : start

        const op = start < end ? Num.add : Num.minus

        const length = _end - _start

        if (length > 0) {
            const array = [...Array(length).keys()]
            return array.map((x) => op (start) (x))
        }
        
        return []
    }

    static last<T>(array: T[]) {
        // cf. https://stackoverflow.com/questions/3216013/get-the-last-item-in-an-array
        const [last] = array.slice(-1)
        return MaybeT.of(last)
    }

    static removeByIdx = <T>(array: T[]) =>  (idx: number)  => {
        return $$ (MaybeT.of) (array.reduce ( (acc: T[], item: T, _idx: number) => {
            if (_idx !== idx) {
                return Arr.push(item)(acc)
            }
            return acc
        }, new Array<T>
        )) 
        .unpackT(array)
    }

    static removeNothingReduce = <T>(acc: T[], item: Maybe<T>) => {
        if (item.value !== null) {
            acc.push(item.value)
            return acc
        } else {
            return acc
        }
    }

    static removeNothings = <T>(array: Array<Maybe<T>>) => {
        return array.reduce(Arr.removeNothingReduce, new Array<T>)
    }

    static removeEmptyStrsReduce =(acc: string[], item: string) => {
        if (item !== "") {
            acc.push(item)
            return acc
        } else {
            return acc
        }
    }

    static removeEmptyStrs = (array: Array<string>) => {
        return array.reduce(Arr.removeEmptyStrsReduce, new Array<string>)
    }


    static removeByItem = <T>(array: T[]) => (item: T) =>  {
        return array.reduce ( (acc: T[], _item: T) => {
            if (_item !== item) {
                return Arr.push(item)(acc)
            }
        }, new Array<T>
        )
    }

    static replaceByIdx = <T>(array: T[]) => (newItem: T) => (idx: number) => {
        return $$ (MaybeT.of) (array.reduce ( (acc: T[], item: T, _idx: number) => {
            if (_idx !== idx) {
                return Arr.push(item)(acc)
            }
            return Arr.push(newItem)(acc)
        }, new Array<T>
        )) 
        .unpackT(array)
    }

    static reverse = <T>(array: T[]) => {
        const copy = [...array]
        return copy.reverse()
    }

    static slice =  <T> (start:number) => (end: number) => (array: T[]) =>  {
        const arrayCopy = [...array]
        return arrayCopy.slice(start, end)
    }

    static arrFunc<T>(funcName: ArrayFunc, arr: T[], newElem: T): T[] {
        const newArr = [...arr]
        newArr[funcName](newElem)
        return newArr
    }
    
    static unshift<T>(arr: T[], newElem: T): T[] {
        return Arr.arrFunc(ArrayFunc.Unshift, arr, newElem)
    }
    
    // static push<T>(arr: T[], newElem: T): T[] {
    //     return arrFunc(ArrayFunc.Push, arr, newElem)
    // }
    
    
}