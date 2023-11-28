class TEIName {
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    get leidenText() {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "reg", "corr", "am"]))
            .map((textNode) => TextNode.expansionsInParens(textNode))
            .map((textNode) => TextNode.delInDoubleBrackets(textNode))
            .map((textNode) => TextNode.suppliedInBrackets(textNode))
            .map(XML.textContent)
            .map((maybeStr) => { return maybeStr.fromMaybe(""); })
            .join("")
            .replace(/[\s\t\n]/g, "");
    }
    get normalizedText() {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "orig", "sic", "del", "surplus", "am"]))
            .join("")
            .replace("][", "")
            .replace(",", "")
            .replace(")", "")
            .replace("(", "")
            .replace("·", "")
            .replace(".", "");
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
TEIName.getLeidenText = (token) => {
    return token.leidenText;
};
TEIName.getNormalizedText = (token) => {
    return token.normalizedText;
};
