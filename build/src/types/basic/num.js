class Num {
}
Num.add = (x) => (y) => {
    return x + y;
};
Num.minus = (x) => (y) => {
    return x - y;
};
Num.eq = (x) => (y) => {
    return x == y;
};
Num.gt = (x) => (y) => {
    return x > y;
};
Num.lt = (x) => (y) => {
    return x < y;
};
class BoundedNum {
    constructor(lowerBound, upperBound, value) {
        this._lower = lowerBound;
        this._upper = upperBound;
        this._value = value;
    }
    get value() {
        return this._value;
    }
}
BoundedNum._checkBounds = (lower) => (upper) => (newValue) => {
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
BoundedNum.decrement = (x) => {
    return BoundedNum.of(x._lower)(x._upper)(x.value - 1);
};
BoundedNum.increment = (x) => {
    return BoundedNum.of(x._lower)(x._upper)(x.value + 1);
};
BoundedNum.of = (lower) => (upper) => (x) => {
    const newVal = BoundedNum._checkBounds(lower)(upper)(x);
    return new BoundedNum(lower, upper, newVal);
};
BoundedNum.value = (x) => {
    return x.value;
};
class NumMaybe {
}
NumMaybe.gt = (x) => (y) => {
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
NumMaybe.lt = (x) => (y) => {
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
