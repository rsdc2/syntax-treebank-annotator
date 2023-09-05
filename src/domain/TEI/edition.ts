
class Edition implements HasToken, HasNode {
    _node: Node
    _element: Element

    constructor(node: HasXMLNode) {
        this._node = node
        this._element = DOM.Node_.element(node).unpackThrow()
    }

    get names(): TEIName[] {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument))
    }

    get tokens(): TEIToken[] {
        return DXML.wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument))
    }

    static of(node: HasXMLNode) {
        return new Edition(node)
    }

    static get xpathAddress(): string {
        return ".//t:div[@type='edition']"
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

}