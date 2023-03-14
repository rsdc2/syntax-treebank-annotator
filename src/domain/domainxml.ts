// Methods shared between Arethusa and EpiDoc

namespace DXML {

    export function multiwordsFromArray(component: MultiwordT): (a: XMLNode[]) => Wordable[] {
        return map(component.of)
    }
    
    export function multiwordsFromXmlDoc(component: MultiwordT, xmldoc: Maybe<XMLDocument | XMLNode>): Wordable[] {
        const nodes = XML.xpathMaybe(component.xpathAddress) (xmldoc)
        const components = nodes.fmap(DXML.multiwordsFromArray(component))
        return maybe (new Array<Wordable>) (components)
    }

    export function node(n: Nodeable) {
        return n._node
    }

    export const nodeXMLStr = (n: Nodeable) => {
        return MaybeT.of(n)
            .fmap(DXML.node)
            .fmap(XML.toStr)
    }

    export function wordsFromArray(component: WordType): (a: Node[]) => Formable[] {
        return map(component.of)
    }

    export function wordsFromXmlDoc(component: docComponentT, xmlDocOrNode: Maybe<XMLDocument | Node>): Formable[] {
        const nodes = XML.xpathMaybe(component.xpathAddress) (xmlDocOrNode)
        const components = nodes.fmap(DXML.wordsFromArray(component))
        return components.unpack(new Array<Formable>)
    }
}