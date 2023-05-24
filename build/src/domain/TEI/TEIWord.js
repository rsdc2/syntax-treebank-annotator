class TEIToken {
    constructor(node) {
        this._node = node;
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static of(node) {
        return new TEIToken(node);
    }
    static get xpathAddress() {
        return Edition.xpathAddress + "//*[self::t:w|self::t:name|self::t:num]";
    }
}
var TEITokenFuncs;
(function (TEITokenFuncs) {
    /**
     * Returns the text of a token without interpuncts
     * @param token
     * @returns string
     */
    TEITokenFuncs.textWithoutInterpuncts = (token) => {
        const textArr = XML.xpath("descendant::text()[not(ancestor::t:g)]")(token._node)
            .unpackT([])
            .map(XML.textContent);
        return Arr.removeNothings(textArr).join("");
    };
    TEITokenFuncs.excludeTextNodesWithAncestors = (tagNames) => (token) => {
        const ancestorXpaths = tagNames.reduce((ancestors, tagName) => {
            return ancestors.concat(`[not(ancestor::t:${tagName})]`);
        }, '');
        const xpathStr = Str.concat(ancestorXpaths)("descendant::text()");
        return XML
            .xpath(xpathStr)(token._node)
            .unpackT([]);
    };
    TEITokenFuncs.textWithSuppliedInBrackets = (textNode) => {
        if (!XML.hasAncestor("supplied")(textNode)) {
            return MaybeT.of(textNode.textContent).unpackT("");
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
})(TEITokenFuncs || (TEITokenFuncs = {}));
