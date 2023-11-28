class TEIToken {
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
            .map(XML.textContent)
            .map((maybeStr) => { return maybeStr.fromMaybe(""); })
            .join("")
            .replace("][", "")
            .replace(",", "")
            .replace(")", "")
            .replace("(", "")
            .replace("·", "")
            .replace(".", "");
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    get textNodes() {
        return XML.xpath("descendant::text()")(this._node)
            .fromMaybe([]);
    }
    static of(node) {
        return new TEIToken(node);
    }
    static get xpathAddress() {
        return Edition.xpathAddress + "//*[self::t:w|self::t:name|self::t:num]";
    }
}
TEIToken.getLeidenText = (token) => {
    return token.leidenText;
};
TEIToken.getNormalizedText = (token) => {
    return token.normalizedText;
};
var TEITokenFuncs;
(function (TEITokenFuncs) {
    /**
     * Returns the text of a token without interpuncts
     * @param token
     * @returns string
     */
    TEITokenFuncs.textWithoutInterpuncts = (token) => {
        const textArr = XML.xpath("descendant::text()[not(ancestor::t:g)]")(token._node)
            .fromMaybe([])
            .map(XML.textContent);
        return Arr.removeNothings(textArr).join("");
    };
})(TEITokenFuncs || (TEITokenFuncs = {}));
var TextNode;
(function (TextNode) {
    TextNode.filterByNotAncestor = (tagNames) => (text) => {
        const ancestorXpaths = tagNames.reduce((ancestors, tagName) => {
            return ancestors.concat(`local-name()="${tagName}" or `);
        }, '');
        // TODO improve this code
        const xpathStr = Str.concat(ancestorXpaths)("parent::*[descendant::text()[not(ancestor::*[");
        const xpathStr_ = Str.substring(0)(xpathStr.length - 4)(xpathStr) + "])]]/descendant::text()";
        return XML.xpath(xpathStr_)(text).unpack([]).length !== 0;
    };
    TextNode.excludeTextNodesWithAncestors = (tagNames) => (token) => {
        const ancestorXpaths = tagNames.reduce((ancestors, tagName) => {
            return ancestors.concat(`[not(ancestor::t:${tagName})]`);
        }, '');
        const xpathStr = Str.concat(ancestorXpaths)("descendant::text()");
        return XML
            .xpath(xpathStr)(token._node)
            .fromMaybe([]);
    };
    TextNode.delInDoubleBrackets = (textNode) => {
        if (!XML.hasAncestor("del")(textNode)) {
            return textNode;
        }
        const preceding = XML.precedingTextNodesWithAncestorByAncestorName("del")(textNode);
        if (preceding.length == 0) {
            textNode.textContent = "[[" + textNode.textContent;
        }
        const following = XML.followingTextNodesWithAncestorByAncestorName("del")(textNode);
        if (following.length == 0) {
            textNode.textContent += "]]";
        }
        return textNode;
    };
    TextNode.expansionsInParens = (textNode) => {
        if (!XML.hasAncestor("ex")(textNode)) {
            return textNode;
        }
        const preceding = XML.precedingTextNodesWithAncestorByAncestorName("ex")(textNode);
        if (preceding.length == 0) {
            textNode.textContent = "(" + textNode.textContent;
        }
        const following = XML.followingTextNodesWithAncestorByAncestorName("ex")(textNode);
        if (following.length == 0) {
            textNode.textContent += ")";
        }
        return textNode;
    };
    TextNode.suppliedInBrackets = (textNode) => {
        if (!XML.hasAncestor("supplied")(textNode)) {
            return MaybeT.of(textNode).fromMaybe(new Text(""));
        }
        const preceding = XML.precedingTextNodesWithAncestorByAncestorName("supplied")(textNode);
        if (preceding.length == 0) {
            textNode.textContent = "[" + textNode.textContent;
        }
        const following = XML.followingTextNodesWithAncestorByAncestorName("supplied")(textNode);
        if (following.length == 0) {
            textNode.textContent += "]";
        }
        return textNode;
    };
})(TextNode || (TextNode = {}));
