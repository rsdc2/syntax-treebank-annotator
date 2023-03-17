
class Edition implements Wordable, Nodeable {
    _node: XMLNode

    constructor(node: XMLNode) {
        this._node = node
    }

    get names(): TEIName[] {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument))
    }

    get wordsProp(): TEIWord[] {
        return DXML.wordsFromXmlDoc(TEIWord, MaybeT.of(this._node.ownerDocument))
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