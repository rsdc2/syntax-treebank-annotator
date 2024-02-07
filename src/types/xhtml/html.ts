

namespace HTML {

    export const contains = (parentNode: Node) => (descendantNode: Node) => {
        return parentNode.contains(descendantNode)
    }

    export const id = (id: string) => {
        return MaybeT.of(document.getElementById(id))
    }

    export const ownerDocument = (node: Node) => {
        return MaybeT.of<Document>(node.ownerDocument)
    }

    export const q = (query: string) => {
        return MaybeT.of(document.querySelector(query))
    }

    export const qThrow = (message: string, query: string) => {
        return MaybeT.ofThrow(message, document.querySelector(query))
    }

    export const setValue = (value: string) => {
        function _setValue(elem: HTMLInputElement | HTMLTextAreaElement) {
            elem.value = value
            return MaybeT.of(elem)
        }
        return _setValue
    }
    
    export const value = (elem: HTMLInputElement | HTMLTextAreaElement) => {
        return elem.value
    }

    export namespace Btn {

    }

    export namespace Div {
        export const textContent = (elem: HTMLDivElement) => {
            return MaybeT.of(elem.textContent)
        }

        export const setOnclickFunc = (func) => (btn: HTMLDivElement) => {
            btn.onclick = func;
        }    
    }

    export namespace Elem {

        export const click = (elem: HTMLElement) => {
            elem.click();
            return elem;
        }

        export const classList = (elem: Element) => {
            return elem.classList
        }

        export const create = (name: string) => {
            return MaybeT.of(document.createElement(name))
        }

        export const getAttr = (qualifiedName: string) => (elem: Element) => {
            return MaybeT.of(elem.getAttribute(qualifiedName))
        }

        export const getHidden = (elem: HTMLElement) => {
            return getAttr("hidden")(elem)
        }

        /**
         * Remove an element from the DOM. Cf. https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
         * @param elem Element
         */
        export const remove = (elem: Element) => {
            elem.remove()
        }

        export const removeAttr = (qualifiedName: string) => (elem: Element) => {
            elem.removeAttribute(qualifiedName)
            return elem
        }
        
        export const setHidden = (elem: HTMLElement) => {
            return HTML.Elem.setAttr("hidden")("")(elem)
        }

        export const unsetHidden = (elem: HTMLElement) => {
            return HTML.Elem.removeAttr("hidden")(elem)
        }

        export const setOnChangeFunc = (func) => (elem: HTMLElement) => {
            elem.onchange = func;
            return elem;
        }

        export const setOnClickFunc = (func) => (elem: HTMLElement) => {
            elem.onclick = func;
            return elem;
        }

        export const toggleHidden = (elem: HTMLElement) => {
            if (MaybeT.of(elem).bind(getHidden).fromMaybe("false") == "false") {
                HTML.Elem.setHidden(elem)
                return
            } 
            HTML.Elem.removeAttr("hidden")(elem)
        }

        export const setAttr = (qualifiedName: string) => (value: string) => (elem: Element) => {
            elem.setAttribute(qualifiedName, value)
            return elem
        }

        export const getStyle = (styleName: string) => (elem: HTMLElement) => {
            const value = elem.style[styleName]
            return MaybeT.of(value)
        }

        export const setStyle = (styleName: string) => (styleValue: string) => (elem: HTMLElement) => {

            if (styleName in elem) {
                elem.style[styleName] = styleValue
            }

            return elem
        }


        export namespace Class {
            export const contains = (token: string) => (elem: Element) => {
                return elem.classList.contains(token)
            }

            export const remove = (token: string) => (elem: Element) => {
                elem.classList.remove(token)
                return elem
            }

            export const add = (token: string) => (elem: Element) => {
                elem.classList.add(token)
                return elem
            }

            export const toggle = (token: string) => (elem: Element) => {
                if (elem.classList.contains(token)) {
                    elem.classList.remove(token)
                } else {
                    elem.classList.add(token)
                }
            }
        }



    }

    export namespace URL {
        export const createObjectURL = (blob: Blob) => {
            return window.URL.createObjectURL(blob)
        }
        export const revokeObjectURL = (url: string) => {
            return window.URL.revokeObjectURL(url)
        }

    }

}