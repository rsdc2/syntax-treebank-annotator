
class TEIToken implements Word, HasForm {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).unpackThrow()
    }

    get normalizedText(): string {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "orig", "am", "sic"]))
            .map( (textNode: Text) => TextNode.suppliedInBrackets(textNode) )
            .join("")
            .replace("][", "")
            .replace(",", "")
    }

    static getNormalizedText = (token: TEIToken) => {
        return token.normalizedText
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    get textNodes(): Text[] {
        return XML.xpath("descendant::text()")(this._node)
            .unpackT([]) as Text[]
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

namespace TextNode {

    export const filterByNotAncestor = 
        (tagNames: string[]) =>
        (text: Text): boolean =>
    {
        const ancestorXpaths = tagNames.reduce(
            (ancestors:string, tagName:string) => {
                return ancestors.concat(`[not(ancestor::t:${tagName})]`)
            }, ''
        )
        const xpathStr = Str.concat(ancestorXpaths)("descendant::text()")
        
        return XML.xpath(xpathStr)(text).unpack([]).length !== 0
    }

    export const excludeTextNodesWithAncestors = 
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
    
    export const suppliedInBrackets = (textNode: Text): string => {
        
    
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
