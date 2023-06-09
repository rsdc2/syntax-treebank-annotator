class Edition {
    constructor(node) {
        this._node = node;
    }
    get names() {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument));
    }
    get tokens() {
        return DXML.wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument));
    }
    static of(node) {
        return new Edition(node);
    }
    static get xpathAddress() {
        return ".//t:div[@type='edition']";
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
}
