
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

    export const textNodesWithoutAncestorsByTagName = 
        (tagNames: string[]) => 
        (token: TEIToken): Text[] => 
    {
        const ancestorXpaths = tagNames.reduce(
            (ancestors:string, tagName:string) => {
                return ancestors.concat(`[not(ancestor::t:${tagName})]`)
            }, ''
        )

        const xpathStr = Str.concat(ancestorXpaths)("descendant::text()")

        return XML
            .xpath(xpathStr)(token._node)
            .unpackT([]) as Text[]
    }

    export const textWithSuppliedInBrackets = (textNode: Text): string => {
        if (!XML.hasAncestor("supplied")(textNode)) {
            return MaybeT.of(textNode.textContent).unpackT("")
        }

        const preceding = XML.precedingTextNodesWithAncestorByAncestorName("supplied")(textNode)
        let returnString = ""
        if (preceding.length == 0) {
            returnString += "["

        }

        returnString += textNode.textContent

        const following = XML.followingTextNodesWithAncestorByAncestorName("supplied")(textNode)

        if (following.length == 0) {
            returnString += "]"
        }

        return returnString

    }
}
