
class TEIName implements TEIToken {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).unpackThrow()
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