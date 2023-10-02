
class Edition implements HasToken, HasNode {
    _node: Node
    _element: Element

    constructor(node: HasXMLNode) {
        this._node = node
        this._element = DOM.Node_.element(node).fromMaybeThrow()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    static getTokens = (edition: Edition) => {
        return edition.tokens
    }

    get names(): TEIName[] {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument)) as TEIName[]
    }

    static of(node: HasXMLNode) {
        return new Edition(node)
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    get tokens(): TEIToken[] {
        return DXML.wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument)) as TEIToken[]
    }

    static get xpathAddress(): string {
        return ".//t:div[@type='edition']"
    }
}