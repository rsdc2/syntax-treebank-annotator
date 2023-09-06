// Methods shared between Arethusa and EpiDoc

namespace DXML {

    export const isArtificial = (n: HasNode) => {
        const node = DXML.node(n)
        return XML.hasAttr('artificial')(node)
    }

    export function multiwordsFromArray(component: MultiwordT): (a: HasXMLNode[]) => HasToken[] {
        return map(component.of)
    }
    
    export function multiwordsFromXmlDoc(component: MultiwordT, xmldoc: Maybe<XMLDocument | HasXMLNode>): HasToken[] {
        const nodes = XML.xpathMaybe(component.xpathAddress) (xmldoc)
        const components = nodes.fmap(DXML.multiwordsFromArray(component))
        return maybe (new Array<HasToken>) (components)
    }

    export function node(n: HasNode) {
        return n._node
    }

    export const nodeXMLStr = (n: HasNode) => {
        return MaybeT.of(n)
            .fmap(DXML.node)
            .fmap(XML.toStr)
    }

    export function wordsFromArray(component: WordType): (a: Node[]) => HasText[] {
        return map(component.of)
    }

    export function wordsFromXmlDoc(component: docComponentT, xmlDocOrNode: Maybe<XMLDocument | Node>): HasText[] {
        const nodes = XML.xpathMaybe(component.xpathAddress) (xmlDocOrNode)
        const components = nodes.fmap(DXML.wordsFromArray(component))
        return components.unpack(new Array<HasText>)
    }
}