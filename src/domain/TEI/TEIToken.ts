
class TEIToken implements Word, HasText {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    
    static getLeidenText = (token: TEIToken) => {
        return token.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "reg", "corr", "am"]))
            .map( (textNode: Text) => TextNode.bracketExpansion(textNode) )
            .map( (textNode: Text) => TextNode.bracketDel(textNode) )
            .map( (textNode: Text) => TextNode.bracketSupplied(textNode) )
            .map( (textNode: Text) => TextNode.bracketSurplus(textNode) )
            .map( (textNode: Text) => TextNode.getTextFromNonTextNode (["lb", "g", "gap"]) (["|", " · ", "[-?-]"]) (textNode) )
            .map(XML.textContent)
            .map( (maybeStr: Maybe<string>) => {return maybeStr.fromMaybe("")})
            .join("")         
            .replace(/\t/g, "")
            .replace(/\n+/g, "|")
            .replace(/\|+/g, "|")
            .replace(/(?<!·)\s(?!·)/g, "")
    }

    static getNormalizedText = (token: TEIToken) => {
        return token.normalizedText
    }

    get leidenText(): string {
        return TEIToken.getLeidenText(this)
    }

    get normalizedText(): string {
        return this.textNodes
            .filter(TextNode.filterByNotAncestor(["g", "orig", "sic", "del", "surplus", "am"]))
            .map(XML.textContent)
            .map( (maybeStr: Maybe<string>) => {return maybeStr.fromMaybe("")})
            .join("")
            .replace("][", "")
            .replace(",", "")
            .replace(")", "")
            .replace("(", "")
            .replace("·", "")
            .replace(".", "")
    }

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    get textNodes(): Text[] {
        return XML.xpath("descendant::text()")(this._node)
            .fromMaybe([]) as Text[]
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
            .fromMaybe([])
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
                return ancestors.concat(`local-name()="${tagName}" or `)
            }, ''
        )

        // TODO improve this code
        const xpathStr = Str.concat(ancestorXpaths)("parent::*[descendant::text()[not(ancestor::*[") 

        const xpathStr_ = Str.substring(0)(xpathStr.length - 4)(xpathStr) + "])]]/descendant::text()"
        
        return XML.xpath(xpathStr_)(text).unpack([]).length !== 0
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
            .fromMaybe([]) as Text[]
    }

    const bracketText = (localName: string) => (openBracket: string) => (closeBracket: string) => (textNode: Text) => {
        if (!XML.hasAncestor(localName)(textNode)) {
            return textNode
        }

        const preceding = XML.precedingTextNodesWithAncestorByAncestorName(localName)(textNode)
        
        if (preceding.length == 0) {
            textNode.textContent = openBracket + textNode.textContent

        }

        const following = XML.followingTextNodesWithAncestorByAncestorName(localName)(textNode)

        if (following.length == 0) {
            textNode.textContent += closeBracket
        }

        return textNode
    }

    export const getTextFromNonTextNode = (localNames: string[]) => (stringReps: string[]) => (text: Text) => {

        // To be used e.g. for <gap>, <lb> and <g> that do not contain text
        // to be included in the treebanked version

        // It is important that the localNames and their respective
        // stringReps are given in the same order
        const precedingItems = XML.previousNode(text)
        const followingItems = XML.nextNode(text)

        // Text to prepend
        let textToPrepend = precedingItems.reduceRight<string>( 
            (acc: string, node: Node): string => {

                if (acc[0] === "?") {
                    return acc
                } 

                if (localNames.includes(node.nodeName) || 
                    (node.nodeName === "#text" && localNames.includes(node.parentNode?.nodeName || ""))) {

                    const localNameIdx = localNames.findIndex( 
                        (value: string) => value === node.nodeName
                    ) 
                    const stringRep = stringReps[localNameIdx] || ""
                    return stringRep + acc    

                } else if (node.textContent === " ") {
                    return " " + acc
                } else {
                    return "?" + acc
                }

            }, ""
        ) 

        // Text to append
        let textToAppend = followingItems.reduce<string>( 
            (acc: string, node: Node): string => {

                if (acc[0] === "?") {
                    return acc
                } 

                if (localNames.includes(node.nodeName) || (node.nodeName === "#text" && localNames.includes(node.parentNode?.nodeName || ""))) {
                    const localNameIdx = localNames.findIndex( 
                        (value: string) => value === node.nodeName
                    ) 
                    const stringRep = stringReps[localNameIdx] || ""
                    return acc + stringRep  
                } else if (node.textContent === " ") {
                    return acc + " "
                } else {
                    return "?" + acc
                }

            }, ""
        ) 

        if (textToPrepend[0] === "?") {
            textToPrepend = textToPrepend.slice(1)
        }

        if (textToAppend[0] === "?") {
            textToAppend = textToAppend.slice(1)
        }

        text.textContent = textToPrepend + text.textContent + textToAppend

        return text
    }
    
    export const bracketDel = (textNode: Text): Text => {
        return bracketText ("del") ("⟦") ("⟧") (textNode)
    }

    export const bracketExpansion = (textNode: Text): Text => {
        return bracketText ("ex") ("(") (")") (textNode)
    }

    export const bracketSupplied = (textNode: Text): Text => {
        return bracketText ("supplied") ("[") ("]") (textNode)
    }

    export const bracketSurplus = (textNode: Text): Text => {
        return bracketText ("surplus") ("{") ("}") (textNode)
    }

}
