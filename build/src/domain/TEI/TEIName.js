class TEIName {
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeThrow();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    get normalizedText() {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "orig", "am", "sic"]))
            .map((textNode) => TextNode.suppliedInBrackets(textNode))
            .join("")
            .replace("][", "")
            .replace(",", "");
    }
    static of(node) {
        return new TEIName(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    get textNodes() {
        return XML.xpath("descendant::text()")(this._node)
            .fromMaybe([]);
    }
    static get xpathAddress() {
        return Edition.xpathAddress + "[self::t:name]";
    }
}
TEIName.getNormalizedText = (token) => {
    return token.normalizedText;
};
