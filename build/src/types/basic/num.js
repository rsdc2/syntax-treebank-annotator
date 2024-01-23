class Num {
    static add = (x) => (y) => {
        return x + y;
    };
    static minus = (x) => (y) => {
        return x - y;
    };
    static eq = (x) => (y) => {
        return x == y;
    };
    static gt = (x) => (y) => {
        return x > y;
    };
    static lt = (x) => (y) => {
        return x < y;
    };
}
class BoundedNum {
    _lower;
    _upper;
    _value;
    constructor(lowerBound, upperBound, value) {
        this._lower = lowerBound;
        this._upper = upperBound;
        this._value = value;
    }
    static _checkBounds = (lower) => (upper) => (newValue) => {
        switch (true) {
            case (newValue <= lower): {
                return lower;
            }
            case (newValue >= upper): {
                return upper;
            }
            default: {
                return newValue;
            }
        }
    };
    static decrement = (x) => {
        return BoundedNum.of(x._lower)(x._upper)(x.value - 1);
    };
    static increment = (x) => {
        return BoundedNum.of(x._lower)(x._upper)(x.value + 1);
    };
    static of = (lower) => (upper) => (x) => {
        const newVal = BoundedNum._checkBounds(lower)(upper)(x);
        return new BoundedNum(lower, upper, newVal);
    };
    get value() {
        return this._value;
    }
    static value = (x) => {
        return x.value;
    };
}
class NumMaybe {
    static gt = (x) => (y) => {
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
    };
    static lt = (x) => (y) => {
        if (x.value === null && y.value === null) {
            return false;
        }
        else if (x.value !== null && y.value === null) {
            return false;
        }
        else if (x.value === null && y.value !== null) {
            return true;
        }
        else if (x.value !== null && y.value !== null && x.value < y.value) {
            return true;
        }
        return false;
    };
}
