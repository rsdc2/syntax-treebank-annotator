class Str {
    static blobify = (s) => {
        return new Blob([s], { type: 'text/plain' });
    };
    static concat = (s2) => (s1) => {
        return s1.concat(s2);
    };
    static decrement(s) {
        return Str.fromNum(parseInt(s) - 1);
    }
    static firstMatch = (pattern) => (s) => {
        const matches = Str.matches(pattern)(s);
        return Arr.head(matches);
    };
    static fromNum(num) {
        return num.toString();
    }
    static increment(s) {
        return Str.fromNum(parseInt(s) + 1);
    }
    static add = (increment) => (s) => {
        return Str.fromNum(parseInt(s) + increment);
    };
    static minus = (decrement) => (s) => {
        return Str.fromNum(parseInt(s) - decrement);
    };
    static indexOf = (substring) => (s) => {
        return s.indexOf(substring);
    };
    static join = (s2) => (joiner) => (s1) => {
        if (s1 === "") {
            return s2;
        }
        return s1.concat(joiner, s2);
    };
    static last = (s) => {
        if (s.length == 0) {
            return '';
        }
        return s[s.length - 1];
    };
    static lastIndexOf = (substring) => (s) => {
        return s.lastIndexOf(substring);
    };
    static lastMatch = (pattern) => (s) => {
        const matches = Str.matches(pattern)(s);
        return Arr.last(matches);
    };
    static len = (s) => {
        return s.length;
    };
    static matches = (pattern) => (s) => {
        let acc = [];
        let result = pattern.exec(s);
        const push = flip(Arr.push);
        while (pattern.lastIndex > 0) {
            let match = MaybeT.of(result).fmap(RegexMatchT.of);
            acc = match.fmap(push(acc)).fromMaybe([]);
            result = pattern.exec(s);
        }
        return acc;
    };
    static replace = (pattern) => (replaceStr) => (srcStr) => {
        return srcStr.replace(pattern, replaceStr);
    };
    static reverse = (s) => {
        const rng = Arr.range(s.length - 1, -1);
        return rng.reduce((acc, idx) => {
            return acc + s[idx];
        }, "");
    };
    static search = (pattern) => (s) => {
        return s.search(pattern);
    };
    static searchEnd = (pattern) => (s) => {
        const matches = MaybeT.of(s.match(pattern));
        const firstMatchLength = matches
            .bind(Arr.head)
            .fmap(Str.len);
        const startPos = MaybeT.ofNonNeg(Str.search(pattern)(s));
        const endPos = startPos.applyFmap(firstMatchLength.fmap(Num.add));
        return endPos;
    };
    static split = (splitOn) => (s) => {
        return s.split(splitOn);
    };
    static strip = (s) => {
        return s.trim();
    };
    static toNum(s) {
        const num = parseInt(s);
        // if (Number.isNaN(num)) {
        //     console.error("Not a number")
        // }
        return num;
    }
    static toMaybeNum(s) {
        const x = parseInt(s);
        if (isNaN(x)) {
            return Nothing.of();
        }
        return MaybeT.of(x);
    }
    static substring = (start) => (end) => (s) => {
        return s.substring(start, end);
    };
}
