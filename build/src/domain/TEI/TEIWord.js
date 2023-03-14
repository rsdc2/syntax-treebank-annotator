class TEIWord {
    constructor(node) {
        this._node = node;
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static of(node) {
        return new TEIWord(node);
    }
    static get xpathAddress() {
        return Edition.xpathAddress + "//*[self::t:w|self::t:name|self::t:num]";
    }
}
