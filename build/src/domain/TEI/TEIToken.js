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
    return token.textNodes
        .filter(TextNode.filterByNotAncestor(["g", "reg", "corr", "am"]))
        .map((textNode) => TextNode.bracketExpansion(textNode))
        .map((textNode) => TextNode.bracketDel(textNode))
        .map((textNode) => TextNode.bracketSupplied(textNode))
        .map((textNode) => TextNode.bracketSurplus(textNode))
        .map((textNode) => TextNode.getTextFromNonTextNode(["lb", "g", "gap"])(["|", " · ", "[-?-]"])(textNode))
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
    // const getTextFromNode = (localName: string) => (openStr: string) => (closeStr: string) => (text: Text) => {
    //     // To be used e.g. for <gap>
    //     const preceding = XML.previousNode(text)
    //     const following = XML.nextNode(text)
    //     const getFirstTextOrLb = (result: Maybe<Node>, node: Node):Maybe<Node> => {
    //         {
    //             if (result.isSomething) {
    //                 return result
    //             }
    //             if (node.textContent !== null && node.textContent !== "") {
    //                 return MaybeT.of(node)
    //             }
    //             if (node.nodeName === localName) {
    //                 return MaybeT.of(node)
    //             }
    //             return Nothing.of()
    //         }
    //     }
    //     const firstTextOrLb = following.reduce<Maybe<Node>>((result: Maybe<Node>, node: Node): Maybe<Node> => 
    //         getFirstTextOrLb(result, node)
    //         , Nothing.of()
    //     )
    //     const lastTextOrLb = preceding.reduce<Maybe<Node>>((result: Maybe<Node>, node: Node): Maybe<Node> => 
    //         getFirstTextOrLb(result, node)
    //         , Nothing.of()
    //     )
    //     if (firstTextOrLb.isNothing && lastTextOrLb.isNothing) {
    //         return text
    //     }
    //     if (lastTextOrLb.value?.nodeName === localName) {
    //         text.textContent = closeStr + text.textContent
    //     }
    //     if (firstTextOrLb.value?.nodeName === localName) {
    //         text.textContent = text.textContent + openStr
    //     }
    //     return text
    // }
    TextNode.getTextFromNonTextNode = (localNames) => (stringReps) => (text) => {
        // To be used e.g. for <gap>
        const precedingItems = XML.previousNode(text);
        const followingItems = XML.nextNode(text);
        // Text to prepend
        let textToPrepend = precedingItems.reduceRight((acc, node) => {
            var _a;
            if (acc[0] === "?") {
                return acc;
            }
            if (localNames.includes(node.nodeName) || (node.nodeName === "#text" && localNames.includes(((_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.nodeName) || ""))) {
                const localNameIdx = localNames.findIndex((value) => value === node.nodeName);
                const stringRep = stringReps[localNameIdx] || "";
                return stringRep + acc;
            }
            else if (node.textContent === " ") {
                return " " + acc;
            }
            else {
                return "?" + acc;
            }
        }, "");
        // Text to append
        let textToAppend = followingItems.reduce((acc, node) => {
            var _a;
            if (acc[0] === "?") {
                return acc;
            }
            if (localNames.includes(node.nodeName) || (node.nodeName === "#text" && localNames.includes(((_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.nodeName) || ""))) {
                const localNameIdx = localNames.findIndex((value) => value === node.nodeName);
                const stringRep = stringReps[localNameIdx] || "";
                return acc + stringRep;
            }
            else if (node.textContent === " ") {
                return acc + " ";
            }
            else {
                return "?" + acc;
            }
        }, "");
        if (textToPrepend[0] === "?") {
            textToPrepend = textToPrepend.slice(1);
        }
        if (textToAppend[0] === "?") {
            textToAppend = textToAppend.slice(1);
        }
        text.textContent = textToPrepend + text.textContent + textToAppend;
        return text;
    };
    TextNode.bracketDel = (textNode) => {
        return bracketText("del")("⟦")("⟧")(textNode);
    };
    TextNode.bracketExpansion = (textNode) => {
        return bracketText("ex")("(")(")")(textNode);
    };
    // export const bracketGap = (textNode: Text): Text => {
    //     return getTextFromNonTextNode (["gap"]) (["[-?-]"]) (textNode)
    // }
    TextNode.bracketSupplied = (textNode) => {
        return bracketText("supplied")("[")("]")(textNode);
    };
    TextNode.bracketSurplus = (textNode) => {
        return bracketText("surplus")("{")("}")(textNode);
    };
    TextNode.newLineLb = (textNode) => {
        return TextNode.getTextFromNonTextNode(["lb", "g", "gap"])(["|", " · ", "[-?-]"])(textNode);
    };
})(TextNode || (TextNode = {}));
