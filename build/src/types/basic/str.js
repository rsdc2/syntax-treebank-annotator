class Str {
    static decrement(s) {
        return Str.fromNum(parseInt(s) - 1);
    }
    static fromNum(num) {
        return num.toString();
    }
    static increment(s) {
        return Str.fromNum(parseInt(s) + 1);
    }
    static toNum(s) {
        return parseInt(s);
    }
    static toMaybeNum(s) {
        const x = parseInt(s);
        if (isNaN(x)) {
            return Nothing.of();
        }
        return MaybeT.of(x);
    }
}
Str.concat = (s2) => (s1) => {
    return s1.concat(s2);
};
Str.firstMatch = (pattern) => (s) => {
    const matches = Str.matches(pattern)(s);
    return head(matches);
};
Str.add = (increment) => (s) => {
    return Str.fromNum(parseInt(s) + increment);
};
Str.minus = (decrement) => (s) => {
    return Str.fromNum(parseInt(s) - decrement);
};
Str.indexOf = (substring) => (s) => {
    return s.indexOf(substring);
};
Str.join = (s2) => (joiner) => (s1) => {
    if (s1 === "") {
        return s2;
    }
    return s1.concat(joiner, s2);
};
Str.lastIndexOf = (substring) => (s) => {
    return s.lastIndexOf(substring);
};
Str.lastMatch = (pattern) => (s) => {
    const matches = Str.matches(pattern)(s);
    return last(matches);
};
Str.len = (s) => {
    return s.length;
};
Str.matches = (pattern) => (s) => {
    let acc = [];
    let result = pattern.exec(s);
    const push = flip(Arr.push);
    while (pattern.lastIndex > 0) {
        let match = MaybeT.of(result).fmap(RegexMatchT.of);
        acc = match.fmap(push(acc)).unpackT([]);
        result = pattern.exec(s);
    }
    return acc;
};
Str.replace = (pattern) => (replaceStr) => (srcStr) => {
    return srcStr.replace(pattern, replaceStr);
};
Str.reverse = (s) => {
    const rng = Arr.range(s.length - 1, -1);
    return rng.reduce((acc, idx) => {
        return acc + s[idx];
    }, "");
};
Str.search = (pattern) => (s) => {
    return s.search(pattern);
};
Str.searchEnd = (pattern) => (s) => {
    const matches = MaybeT.of(s.match(pattern));
    const firstMatchLength = matches
        .bind(head)
        .fmap(Str.len);
    const startPos = MaybeT.ofNonNeg(Str.search(pattern)(s));
    const endPos = startPos.applyFmap(firstMatchLength.fmap(Num.add));
    return endPos;
};
Str.split = (splitOn) => (s) => {
    return s.split(splitOn);
};
Str.strip = (s) => {
    return s.trim();
};
Str.substring = (start) => (end) => (s) => {
    return s.substring(start, end);
};
