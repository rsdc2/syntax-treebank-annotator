
class TEIToken implements Word, Formable {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    static of(node: Node) {
        return new TEIToken(node)
    }

    static get xpathAddress(): string {
        return Edition.xpathAddress + "//*[self::t:w|self::t:name|self::t:num]"
    }
}

namespace TEITokenFuncs {

    /**
     * Returns the text of a token without interpuncts
     * @param token 
     * @returns string
     */
    export const textWithoutInterpuncts = (token: TEIToken): string => {
        const textArr = XML.xpath("descendant::text()[not(ancestor::t:g)]")(token._node)
            .unpackT([])
            .map(XML.textContent)
            
        return Arr.removeNothings(textArr).join("")
    }
}
