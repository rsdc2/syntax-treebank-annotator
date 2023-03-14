
class TEIWord implements Word, Formable {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    static of(node: Node) {
        return new TEIWord(node)
    }

    static get xpathAddress(): string {
        return Edition.xpathAddress + "//*[self::t:w|self::t:name|self::t:num]"
    }
}