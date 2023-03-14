class RegexMatch {
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
    static lastIndex(match) {
        return match.lastIndex;
    }
}
RegexMatchT.groups = (match) => {
    return match.groups;
};
RegexMatchT.of = (arr) => {
    return new RegexMatch(arr);
};
