
class Num {

    static add = (x: number) => (y: number) => {
        return x + y
    } 

    static minus = (x: number) => (y: number) => {
        return x - y
    }

    static eq = (x: number) => (y: number) => {
        return x == y
    }

    static gt = (x: number) => (y: number) => {
        return x > y
    }

    static lt = (x: number) => (y: number) => {
        return x < y
    }

}

class BoundedNum {
    _lower: number
    _upper: number
    _value: number

    constructor (lowerBound: number, upperBound: number, value: number) {
        this._lower = lowerBound
        this._upper = upperBound
        this._value = value
    }

    static _checkBounds = (lower: number)=> (upper: number) => (newValue: number) => {
        switch (true) {
            case (newValue <= lower):{
                return lower
            }
            case (newValue >= upper): {
                return upper
            }
            default: {
                return newValue
            }
        } 
    }

    static decrement = (x: BoundedNum) => {
        return BoundedNum.of (x._lower) (x._upper) (x.value - 1)
    }

    static increment = (x: BoundedNum) => {
        return BoundedNum.of (x._lower) (x._upper) (x.value + 1)
    }

    static of = (lower: number)=> (upper: number) => (x: number) => {
        const newVal = BoundedNum._checkBounds(lower) (upper) (x)
        return new BoundedNum(lower, upper, newVal)
    }

    get value () {
        return this._value
    }

    static value = (x: BoundedNum) => {
        return x.value
    }
}

class NumMaybe {

    static gt = (x: Maybe<number>) => (y: Maybe<number>) => {
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

    static lt = (x: Maybe<number>) => (y: Maybe<number>) => {
        if (x.value === null && y.value === null) {
            return false
        } else if (x.value !== null && y.value === null) {
            return false
        } else if (x.value === null && y.value !== null) {
            return true
        } else if (x.value !== null && y.value !== null && x.value < y.value) {
            return true
        }
        return false
    }

}