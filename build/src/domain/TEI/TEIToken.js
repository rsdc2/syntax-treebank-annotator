class TEIToken {
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    get leidenText() {
        return TEIToken.getLeidenText(this);
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
    // Returns the Leiden text of a token
    // Includes line breaks and interpuncts
    return token.textNodes
        .filter(TextNode.filterByNotAncestor(["g", "reg", "corr", "am"]))
        .map((textNode) => TextNode.bracketExpansion(textNode))
        .map((textNode) => TextNode.bracketSupplied(textNode))
        .map((textNode) => TextNode.bracketDel(textNode))
        .map((textNode) => TextNode.bracketSurplus(textNode))
        .map((textNode) => TextNode.getTextFromNonTextNode(["|"])(["g", "lb", "gap"])([" · ", "|", "[-?-]"])(textNode))
        .map(XML.textContent)
        .map((maybeStr) => { return maybeStr.fromMaybe(""); })
        .join("")
        .replace(/\t/g, "")
        .replace(/\n+/g, "|")
        .replace(/\|+/g, "|")
        .replace(/(?<!·)\s(?!·)/g, "");
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
    TextNode.getTextFromNonTextNode = (boundaries) => (localNames) => (stringReps) => (text) => {
        // To be used e.g. for <gap>, <lb> and <g> that do not contain text
        // to be included in the treebanked version
        // It is important that the localNames and their respective
        // stringReps are given in the same order
        const precedingItems = XML.previousNode(text);
        const followingItems = XML.nextNode(text);
        const _reduceTextToAdd = (acc, node) => {
            var _a, _b;
            if (Arr.last(acc).value === "[stop]") {
                return acc;
            }
            else if (boundaries.includes(Arr.last(acc).fromMaybe(""))) {
                return acc;
            }
            if (localNames.includes(node.nodeName) ||
                (node.nodeName === "#text" && localNames.includes(((_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.nodeName) || ""))) {
                const localNameIdx = localNames.findIndex((value) => value === node.nodeName);
                const stringRep = stringReps[localNameIdx] || "";
                return Arr.concat(acc)([stringRep]);
            }
            else if (((_b = node.textContent) === null || _b === void 0 ? void 0 : _b.trim()) === "") {
                return acc;
            }
            else {
                return Arr.concat(acc)(['[stop]']);
            }
        };
        let textToPrepend = precedingItems
            .reduceRight(_reduceTextToAdd, [])
            .reverse()
            .join("")
            .replace("[stop]", "");
        let textToAppend = followingItems
            .reduce(_reduceTextToAdd, [])
            .join("")
            .replace("[stop]", "");
        text.textContent = textToPrepend + text.textContent + textToAppend;
        return text;
    };
    TextNode.bracketDel = (textNode) => {
        return bracketText("del")("⟦")("⟧")(textNode);
    };
    TextNode.bracketExpansion = (textNode) => {
        return bracketText("ex")("(")(")")(textNode);
    };
    TextNode.bracketSupplied = (textNode) => {
        return bracketText("supplied")("[")("]")(textNode);
    };
    TextNode.bracketSurplus = (textNode) => {
        return bracketText("surplus")("{")("}")(textNode);
    };
})(TextNode || (TextNode = {}));
