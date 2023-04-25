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
    TEITokenFuncs.removeInterpunctTags = (token) => {
        const textArr = XML.xpath("descendant::text()[not(ancestor::t:g)]")(token._node)
            .unpackT([])
            .map(XML.textContent);
        return Arr.removeNothings(textArr).join("");
    };
})(TEITokenFuncs || (TEITokenFuncs = {}));
