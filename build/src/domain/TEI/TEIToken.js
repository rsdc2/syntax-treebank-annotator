class TEIToken {
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
            return ancestors.concat(`[not(ancestor::t:${tagName})]`);
        }, '');
        const xpathStr = Str.concat(ancestorXpaths)("descendant::text()");
        return XML.xpath(xpathStr)(text).unpack([]).length !== 0;
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
    TextNode.suppliedInBrackets = (textNode) => {
        if (!XML.hasAncestor("supplied")(textNode)) {
            return MaybeT.of(textNode.textContent).fromMaybe("");
        }
        const preceding = XML.precedingTextNodesWithAncestorByAncestorName("supplied")(textNode);
        let returnString = "";
        if (preceding.length == 0) {
            returnString += "[";
        }
        returnString += textNode.textContent;
        const following = XML.followingTextNodesWithAncestorByAncestorName("supplied")(textNode);
        if (following.length == 0) {
            returnString += "]";
        }
        return returnString;
    };
})(TextNode || (TextNode = {}));
