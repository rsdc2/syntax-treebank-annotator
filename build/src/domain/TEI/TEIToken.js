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
            .map((textNode) => TextNode.bracketExpansion(textNode))
            .map((textNode) => TextNode.bracketDel(textNode))
            .map((textNode) => TextNode.bracketSupplied(textNode))
            .map((textNode) => TextNode.bracketSurplus(textNode))
            .map((textNode) => TextNode.bracketGap(textNode))
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
    const bracketText = (localName) => (openBracket) => (closeBracket) => (textNode) => {
        if (!XML.hasAncestor(localName)(textNode)) {
            return textNode;
        }
        const preceding = XML.precedingTextNodesWithAncestorByAncestorName(localName)(textNode);
        if (preceding.length == 0) {
            textNode.textContent = openBracket + textNode.textContent;
        }
        const following = XML.followingTextNodesWithAncestorByAncestorName(localName)(textNode);
        if (following.length == 0) {
            textNode.textContent += closeBracket;
        }
        return textNode;
    };
    const getTextFromNode = (localName) => (openStr) => (closeStr) => (text) => {
        var _a, _b;
        const preceding = XML.previous(text);
        const following = XML.next(text);
        if (((_a = Arr.last(preceding)._value) === null || _a === void 0 ? void 0 : _a.nodeName) !== localName && following[0].nodeName !== localName) {
            return text;
        }
        if (((_b = Arr.last(preceding)._value) === null || _b === void 0 ? void 0 : _b.nodeName) === localName) {
            text.textContent = text.textContent + closeStr;
        }
        if (following[0].nodeName === localName) {
            text.textContent = openStr + text.textContent;
        }
        return text;
    };
    TextNode.bracketDel = (textNode) => {
        return bracketText("del")("⟦")("⟧")(textNode);
    };
    TextNode.bracketExpansion = (textNode) => {
        return bracketText("ex")("(")(")")(textNode);
    };
    TextNode.bracketGap = (textNode) => {
        return getTextFromNode("gap")("[-gap-]")("[-gap-]")(textNode);
    };
    TextNode.bracketSupplied = (textNode) => {
        return bracketText("supplied")("[")("]")(textNode);
    };
    TextNode.bracketSurplus = (textNode) => {
        return bracketText("surplus")("{")("}")(textNode);
    };
})(TextNode || (TextNode = {}));
