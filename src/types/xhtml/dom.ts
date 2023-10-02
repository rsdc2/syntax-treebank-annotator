namespace DOM {
    export namespace Attr {
        export const value = (attr: Attr) => attr.value
    }

    export namespace Elem {
        export const attributes = (e: Element) => {return e.attributes}
    }

    export namespace Node_ {
        export const element = (n: Node): Maybe<Element> => {
            if (n.nodeType === Node.ELEMENT_NODE) {
                return MaybeT.of(n) as Just<Element>
            } else if (n.nodeType === Node.DOCUMENT_NODE) {
                return MaybeT.of(n['documentElement'])
            }
    
            return Nothing.of()
        }
    }

    export namespace NamedNodeMap {
        export const getNamedItem = (qualifiedName: string) => (m: NamedNodeMap): Maybe<Attr> => {
            return MaybeT.of(m.getNamedItem(qualifiedName))
        }

        export function getNamedItemNS(namespace: string, localName: string, m: NamedNodeMap): Maybe<Attr> {
            return MaybeT.of(m.getNamedItemNS(namespace, localName))
        }


    }
}