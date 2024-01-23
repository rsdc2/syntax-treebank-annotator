class Edition {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static getTokens = (edition) => {
        return edition.tokens;
    };
    get names() {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument));
    }
    static of(node) {
        return new Edition(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    get tokens() {
        return DXML.wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument));
    }
    static get xpathAddress() {
        return ".//t:div[@type='edition']";
    }
}
