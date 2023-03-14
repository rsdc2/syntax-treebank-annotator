class TEIName {
    constructor(node) {
        this._node = node;
    }
    static get xpathAddress() {
        return Edition.xpathAddress + "[self::t:name]";
    }
    static of(node) {
        return new TEIName(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
}
