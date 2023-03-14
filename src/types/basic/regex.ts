interface IRegexMatch {
    matchStr: string
    groups: string[]
    index: number
    length: number
    lastIndex: number
}

class RegexMatch implements IRegexMatch {
    matchStr: string
    groups: string[]
    index: number
    length: number

    constructor (arr: RegExpExecArray) {
        this.matchStr = arr[0]
        this.groups = arr.splice(1)
        this.index = arr.index
        this.length = arr[0].length
    }

    get lastIndex() {
        return this.index + this.length
    }
}

class RegexMatchT {
    static firstIndex(match: RegexMatch) {
        return match.index
    }

    static groups = (match: RegexMatch) => {
        return match.groups
    }

    static lastIndex(match: RegexMatch) {
        return match.lastIndex
    }

    static of = (arr: RegExpExecArray) => {
        return new RegexMatch (arr)
    }
}