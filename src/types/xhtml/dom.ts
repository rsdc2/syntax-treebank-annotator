namespace DOM {
    export namespace Attr {
        export const value = (attr: Attr) => attr.value
    }

    export namespace Elem {
        export const attributes = (e: Element) => e.attributes
    }

    export namespace Node_ {
        export const element = (n: Node): Maybe<Element> => {
            if (n.nodeType === Node.ELEMENT_NODE) {
                return MaybeT.of(n) as Just<Element>
            }
    
            return Nothing.of()
        }
    }

    export namespace NamedNodeMap {
        export const getNamedItem = (qualifiedName: string) => (m: NamedNodeMap): Maybe<Attr> => {
            return MaybeT.of(m.getNamedItem(qualifiedName))
        }

        export const getNamedItemNS = (namespace: string) => (localName: string) => (m: NamedNodeMap): Maybe<Attr> => {
            return MaybeT.of(m.getNamedItemNS(namespace, localName))
        }


    }
}