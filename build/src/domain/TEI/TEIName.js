class TEIName {
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    get normalizedText() {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "orig", "sic", "del"])) // "am"
            .map((textNode) => TextNode.suppliedInBrackets(textNode))
            .join("")
            .replace("][", "")
            .replace(",", "")
            .replace(")", "")
            .replace("(", "");
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
