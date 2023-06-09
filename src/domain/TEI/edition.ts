
class Edition implements Tokenable, Nodeable {
    _node: XMLNode

    constructor(node: XMLNode) {
        this._node = node
    }

    get names(): TEIName[] {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument))
    }

    get tokens(): TEIToken[] {
        return DXML.wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument))
    }

    static of(node: XMLNode) {
        return new Edition(node)
    }

    static get xpathAddress(): string {
        return ".//t:div[@type='edition']"
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

}