class Str {

    static blobify = (s: string) => {
        return new Blob([s], {type: 'text/plain'})
    }

    static concat = (s2: string)  => (s1: string) => {
        return s1.concat(s2);
    }

    static decrement (s: string) {
        return Str.fromNum(parseInt(s) - 1)
    }

    static firstMatch = (pattern: RegExp) => (s: string) => {
        const matches = Str.matches (pattern) (s)
        return Arr.head(matches)
    }

    static fromNum (num: number) {
        return num.toString()
    }

    static increment (s: string) {
        return Str.fromNum(parseInt(s) + 1)
    }

    static add = (increment: number) => (s: string) => {
        return Str.fromNum(parseInt(s) + increment)
    }


    static minus = (decrement: number) => (s: string) => {
        return Str.fromNum(parseInt(s) - decrement)
    }

    static indexOf = (substring: string) => (s: string) => {
        return s.indexOf(substring)
    }

    static join = (s2: string) => (joiner: string) => (s1: string) => {
        if (s1 === "") {
            return s2
        }

        return s1.concat(joiner, s2)
    }

    static last = (s: string): string => {
        if (s.length == 0) {
            return ''
        }
        return s[s.length -1]
    }

    static lastIndexOf = (substring: string) => (s: string)  => {
        return s.lastIndexOf(substring)
    }

    static lastMatch = (pattern: RegExp) => (s: string) => {
        const matches = Str.matches (pattern) (s)
        return Arr.last(matches)
    }

    static len = (s: string) => {
        return s.length
    } 

    static matches = (pattern: RegExp) => (s: string) => {
        let acc: RegexMatch[] = []

        let result = pattern.exec(s)
        const push = flip(Arr.push)

        while (pattern.lastIndex > 0) {
            let match = MaybeT.of(result).fmap(RegexMatchT.of)
            acc = match.fmap(push(acc)).fromMaybe([])
            result = pattern.exec(s)
        }
        return acc
    }

    static replace = (pattern: string | RegExp) => (replaceStr: string) => (srcStr: string) => {
        return srcStr.replace(pattern, replaceStr)
    }

    static reverse = (s: string) => {
        const rng = Arr.range(s.length - 1, -1)

        return rng.reduce(
            (acc: string, idx: number) => {
                return acc + s[idx]
            }
        , "")

    }

    static search = (pattern: string | RegExp) => (s: string) => {
        return s.search(pattern)
    }

    static searchEnd = (pattern: string | RegExp) => (s: string) => {
        const matches = MaybeT.of(s.match(pattern))
        const firstMatchLength = matches
            .bind(Arr.head)
            .fmap(Str.len)

        const startPos = MaybeT.ofNonNeg(Str.search (pattern) (s))
        const endPos = startPos.applyFmap(firstMatchLength.fmap(Num.add))
        return endPos
    }

    static split = (splitOn: string | RegExp) => (s: string) =>  {
        return s.split(splitOn)
    }

    static strip = (s: string) => {
        return s.trim()
    }

    static toNum (s: string) {
        const num = parseInt(s)
        // if (Number.isNaN(num)) {
        //     console.error("Not a number")
        // }
        return num
    }

    static toMaybeNum (s: string) {
        const x = parseInt(s)
        if (isNaN(x)) {
            return Nothing.of<number>()
        }
        return MaybeT.of(x)
    }

    static substring = (start: number) => (end: number) => (s: string) => {
        return s.substring(start, end)
    }
}