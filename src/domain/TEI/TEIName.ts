
class TEIName implements TEIToken {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    static getNormalizedText = (token: TEIToken) => {
        return token.normalizedText
    }

    get normalizedText(): string {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "orig", "sic", "del"])) // "am"
            .map( (textNode: Text) => TextNode.suppliedInBrackets(textNode) )
            .join("")
            .replace("][", "")
            .replace(",", "")
            .replace(")", "")
            .replace("(", "")
    }

    static of(node: Node) {
        return new TEIName(node)
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    get textNodes(): Text[] {
        return XML.xpath("descendant::text()")(this._node)
            .fromMaybe([]) as Text[]
    }

    static get xpathAddress(): string {
        return Edition.xpathAddress + "[self::t:name]"
    }

}