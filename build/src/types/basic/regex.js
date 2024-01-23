class RegexMatch {
    matchStr;
    groups;
    index;
    length;
    constructor(arr) {
        this.matchStr = arr[0];
        this.groups = arr.splice(1);
        this.index = arr.index;
        this.length = arr[0].length;
    }
    get lastIndex() {
        return this.index + this.length;
    }
}
class RegexMatchT {
    static firstIndex(match) {
        return match.index;
    }
    static groups = (match) => {
        return match.groups;
    };
    static lastIndex(match) {
        return match.lastIndex;
    }
    static of = (arr) => {
        return new RegexMatch(arr);
    };
}
