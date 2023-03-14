
class TEIName implements Word, Formable {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    static get xpathAddress(): string {
        return Edition.xpathAddress + "[self::t:name]"
    }

    static of(node: Node) {
        return new TEIName(node)
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }
}