interface HasXMLNode extends Node {
    attributes: NamedNodeMap
    setAttribute: (name: string, value:string) => void
}

interface HasNode {
    _node: Node   
}


interface HasElement {
    _element: Element
    attrs: NamedNodeMap
}

class HasNodeT {
    static element(n: HasNode): Maybe<Element> {
        if (n._node.nodeType === Node.ELEMENT_NODE) {
            return MaybeT.of(n._node) as Just<Element>
        }

        return Nothing.of()
    }
    
    static node(n: HasNode): Node {
        return n._node
    }
}

interface HasText extends HasNode, HasElement {
    text: Maybe<string>
}

interface HasToken extends HasText {
    tokens: HasText[]
}

class HasFormT {
    static form(f: HasText) {
        return f.text
    }
}

class HasTokensT {
    static tokens(tokenable: HasToken): HasText[] {
        return tokenable.tokens
    }
}

class Word implements HasNode, HasText {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(this._node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    static of(node: HasXMLNode): HasText {
        return new Word(node)
    }

    static get xpathAddress(): string {
        return ".//"
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }
}

type WordType = typeof Word

class Multiword implements HasNode, HasText, HasToken {
    _node: Node
    _element: Element

    constructor(node: HasXMLNode) {
        this._node = node
        this._element = DOM.Node_.element(this._node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    static of(node: HasXMLNode): HasToken {
        return new Multiword(node)
    }

    static get xpathAddress(): string {
        return ".//"
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    get tokens(): HasText[] {
        return []
    }
}

type MultiwordT = typeof Multiword




class XML {
    
    static _appendDocElement(xmldoc: XMLDocument, element: Maybe<Element>) {
        return MaybeT.of(xmldoc)
            .bind(XML.firstDocChild)
            .bind(XML.appendElementToNode(element))
            .bind(XML.ownerDocument)
    }
    
    static appendToDocElement(xmldoc: XMLDocument) {
        function _appendToDoc(element: Maybe<Element>) {
            return XML._appendDocElement(xmldoc, element)
        }
        return _appendToDoc
    }
    
    static appendElementToDoc(element: Maybe<Element>) {
    
        function _appendToDoc(xmldoc: XMLDocument) {
            return XML._appendDocElement(xmldoc, element)
        }
        return _appendToDoc
    }

    static _appendDocElementPretty(xmldoc: XMLDocument, element: Maybe<Element>) {
        return MaybeT.of(xmldoc)
            .bind(XML.firstDocChild)
            .bind(XML.appendElementToNode(element))
            .bind(XML.appendTextToNode("\n"))
            .bind(XML.ownerDocument)
    }

    static appendElementToDocPretty(element: Maybe<Element>) {
    
        function _appendToDoc(xmldoc: XMLDocument) {
            return XML._appendDocElementPretty(xmldoc, element)
        }
        return _appendToDoc
    }

    static appendToDocElementPretty(xmldoc: XMLDocument) {
        function _appendToDoc(element: Maybe<Element>) {
            return XML._appendDocElementPretty(xmldoc, element)
        }
        return _appendToDoc
    }

    static appendElementToNode(element: Maybe<Element>) {

        function _appendToNode(node: N): Maybe<N> {
            return element
                .bind(XML.appendToNodeChild(node))
        }
        return _appendToNode
    }
    
    static _appendElementNodePretty(element: Maybe<Element>, node: N) {
        return MaybeT.of(node)
            .bind(XML.appendTextToNode('\t'))
            .applyBind(element.fmap(XML.appendChildToNode))
            .bind(XML.appendTextToNode('\n'))
    }

    static appendElementToNodePretty(element: Maybe<Element>) {

        function _appendToNode(node: Node): Maybe<Node> {
            return XML._appendElementNodePretty(element, node)
        }
        return _appendToNode
    }
    
    static _appendNodeChild(parent: Node, child: Node) {
        return MaybeT.of(parent.appendChild(child))
            .bind(XML.parent)
    }

    static appendToNodeChild (parent: Node) {
        function _appendChild (child: Node) {
            return XML._appendNodeChild(parent, child)
        }
        return _appendChild
    }

    static appendChildToNode = (child: Node) => (parent: Node) => {
        return XML._appendNodeChild(parent, child)
    }

    static prependChildToNode = (child: Node) => (parent: Node) => {
        // NB! Insert before deep copies the child

        parent.firstChild === null ? 
            XML.appendChildToNode (child) (parent) :
            XML.insertBefore (child) (parent.firstChild)

        return parent
    }   

    static appendChildrenToNode = (children: Node[]) => (parent: Node) => {
        return children.reduce(
            (acc: Maybe<Node>, sentNode: Node) => {
                return acc.bind(XML.appendChildToNode(sentNode))
            }
        , MaybeT.of(parent))
    }

    static _appendNodeText (node: N, s:string) {
        const textelem = MaybeT.of(node.ownerDocument)
            .fmap(XML.createTextElementFromDoc (s))
        return textelem.bind(XML.appendToNodeChild(node))
    }

    static appendToNodeText (node: N) {
        function _appendChild (s: string) {
            return XML._appendNodeText(node, s)
        }
        return _appendChild
    }
    
    static appendTextToNode (s: string) {
        function _appendChild (node: N) {
            return XML._appendNodeText(node, s)
        }
        return _appendChild
    }

    static attr = (attrName: string) => (node: Node): Maybe<Node> => {
        return MaybeT.of(
            XML.attrs(node)[attrName]
        )
    }

    static attrs(node: Node) {
        return XML
            .xpathMaybeC ("attribute::*") (MaybeT.of(node))
            .fromMaybe([])
            .reduce( (acc: {[k: string]: Node}, item: Node) => {
                acc[item.nodeName] = item
                return acc
            }, {})

    }

    static attrVal(attrName: string) {
        function _attr(node: Node) {
            return MaybeT.of(
                XML.attrs(node)[attrName]
            ).bind(XML.nodeValue)
        }
        return _attr
    }

    static childById = (id: string) => (parent: Node) => {
        const children = XML.xpathMaybeC (`child::*[@id="${id}"]`) (MaybeT.of(parent))
        return children.bind(Arr.head)
    }

    static childNodes = (node: Node) => {
        let _nodes: Node[] = []
        node.childNodes.forEach( (node: Node) => {
            _nodes.push(node)
        })
        return _nodes
    }

    static childNodesByTagName = (tagName: string) => (node: Node) => {
        let _nodes: Node[] = []
        node.childNodes.forEach( (node: Node) => {
            if (node.nodeName === tagName) {
                _nodes.push(node)
            } 
        })
        return _nodes
    }

    static concatText = (textNodes: Text[]): string => {
        return textNodes.map(XML.textContent).join("")
    }

    static createElement = (elementName: string) => (attrs: object) => (xmldoc: XMLDocument): Element => {
        const e = xmldoc.createElement(elementName)

        Object.keys(attrs).forEach(k => {
            e.setAttribute(k, attrs[k])
        });

        return e as Element
    }

    static createTextElementFromDoc(text: string) {
        function _createElement(xmldoc: XMLDocument) {
            return xmldoc.createTextNode(text)
        }
        return _createElement
    }

    static createTextElementFromNode(text: string) {
        function _createElement(node: Node) {
            const doc = MaybeT.of(node).bind(XML.ownerDocument)
            return doc.fmap(XML.createTextElementFromDoc(text))
        }
        return _createElement
    }

    static deepcopy(node: Node): Node {
        return node.cloneNode(true)
    }

    static depth(node: Node) {
        
        function _getParent(_node: Maybe<Node>, counter: number): number {
            const parent = _node.bind(XML.parent)
            const parentIsRoot = parent
                .fmap(XML.isRoot)
                .unpack(false)

            if (parentIsRoot ) {
                return counter
            }

            return _getParent(parent, counter += 1)
        }

        return _getParent(MaybeT.of(node), 0)

    }

    static descendantById = (id: string) => (node: Node) => {
        return XML.xpathMaybeC (`descendant::*[@id="${id}"]`) (MaybeT.of(node))
            .bind(Arr.head)
    }

    static descendants(node: Node) {
        return XML.xpathMaybeC ('descendant::*') (MaybeT.of(node))
    }

    static descendantsOrSelf(node: Node) {
    return XML.xpathMaybeC ('descendant-or-self::*') (MaybeT.of(node))
    }

    static descendantTextNodes(node: Node) {
        return XML.xpathMaybeC('descendant::text()')(MaybeT.of(node)) as unknown as Maybe<Text[]>
    }

    static documentElement(xmldoc: XMLDocument) {
        return MaybeT.of<Node>(xmldoc.documentElement)
    }

    static docElement(doc: XMLDocument) {
        return doc.documentElement
    }

    static firstChild(node: Node) {
        return MaybeT.of(node.firstChild)
    }

    static firstDocChild(doc: XMLDocument) {
        return MaybeT.of(doc.firstChild)
    }

    static followingTextNodesWithAncestorByAncestorId = (ancestorName: string) => (attrName: string) => (attrVal: string) => (node: Node) =>  {
        return XML.xpathMaybeC(`following::text()[ancestor::${ancestorName}[@${attrName}="${attrVal}"]]`) (MaybeT.of(node))
            .fromMaybe([]) as Text[]
    }

    static followingTextNodesWithAncestorByAncestorName = (ancestorName: string) => (node: Node) =>  {
        return XML.xpathMaybeC(`following::text()[ancestor::${ancestorName}]`) (MaybeT.of(node))
            .fromMaybe([]) as Text[]
    }
    
    static fromXMLStr(xml: string): XMLDocument {

        if (xml === '') {
            throw new XMLParseError("XML file is empty")
        }

        // if (xml === "<empty/>") {
        //     return new DOMParser().parseFromString(
        //         '<?xml version="1.0" encoding="UTF-8"?>', "application/xml" 
        //     )
        // }
        const result = new DOMParser()
            .parseFromString(xml, "application/xml")

        // NB This produces a Content Security Policy error on Chrome if the result 
        // is the parser error response (i.e. invalid XML)
        // See https://github.com/Azure/azure-sdk-for-js/issues/13268
        
        if (result.querySelector("parsererror")) { 
            // Cf. https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
            // console.log(result)
            throw new XMLParseError("Could not parse XML")
        }
        return result
    }

    static getAttrVal = (namespace: string) => (localName: string) => (token: HasElement): Maybe<string> => {
        const attrs = token.attrs
        return DOM.NamedNodeMap
            .getNamedItemNS(namespace, localName, attrs)
            .fmap(DOM.Attr.value)
    }

    static hasAncestor = (tagName: string) => (node: Node) => {
        const ancestors = XML
            .xpath(`ancestor::t:${tagName}`)(node)
            .fromMaybe([])
        return ancestors.length > 0
    }

    static hasAttr(attr: string) {
        function _hasAttr(node: Node) {
            const attributes = XML.xpathMaybeC (`attribute::${attr}`) (MaybeT.of(node)).fromMaybe([])
            return attributes.length > 0
        }
        return _hasAttr
    }

    static hasAttrVal(attrName: string) {
        function _hasAttr(value: string) {
            function __hasAttr(node: Node) {
                return XML.attr(attrName) (node)
                    .bind(XML.nodeValue)
                    .unpack("") === value
            }
            return __hasAttr
        }
        return _hasAttr
    }
    
    static _insertBefore(nodeToInsert: Node | Element | Text) {
        function __insertBefore (refNode: Node | ChildNode | null) {
        
            function ___insertBefore(parentNode: Node | ParentNode) {
                return parentNode.insertBefore(nodeToInsert, refNode)
            }
            return ___insertBefore
        }

        return __insertBefore
    }

    static insertBefore = (nodeToInsert: Node | Element | Text) => (refNode: Node) => {

        function _insertBefore(parentNode: Maybe<Node>): Maybe<ParentNode>  {
            const _nodeToInsert = XML.deepcopy(nodeToInsert)
            const insertNewNode = MaybeT.of(refNode)
                .fmap(XML._insertBefore(_nodeToInsert))
            const insertedNode = parentNode
                .applyFmap(insertNewNode)
            return insertedNode
                .bind(XML.parent)
        }
        
        const _parentNode = MaybeT.of(refNode).bind(XML.parent)
        return _insertBefore(_parentNode)

    }

    static insertAfter = (nodeToInsert: Node | Text | Element) => (refNode: Node) => {
        const _refNode = MaybeT.of(refNode.nextSibling)
        const parentNode = MaybeT.of(refNode).bind(XML.parent)

        // Need to get the value out of _refNode because 
        // if the reference node is null, the method
        // .insertBefore automatically inserts the node last
        // see https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
        const insertNewNode = XML._insertBefore (nodeToInsert) (_refNode.value)
        const insertedNode = parentNode.fmap(insertNewNode)
        return insertedNode.bind(XML.parent)
    }

    static isDocument(node: Node | XMLDocument) {
        return node.nodeName === "#document"
    }

    static isParseError(doc: Document) {
        return doc.firstChild?.nodeName === "html"
    }

    static isRoot(node: Node) {
        return node === node.getRootNode()
    }

    static isTop(node: Node) {
        const nodeName = MaybeT.of(node.parentNode)
            .fmap(XML.nodeName).value
        return nodeName === '#document' || nodeName === null
    }

    static lastChild(node: Node) {
        return MaybeT.of(node.lastChild)
    }

    static next = (node: Node) => {
        return (XML.xpathMaybeC("following::*") (MaybeT.of(node)).fromMaybe([]))        
    }

    static nextNode = (node: Node) => {
        return (XML.xpathMaybeC("following::node()") (MaybeT.of(node)).fromMaybe([]))        
    }


    static nextSibling = (node: Node) => {
        return Arr.head (XML.xpathMaybeC("following-sibling::*") (MaybeT.of(node)).fromMaybe([]))
    }

    static nextSiblingElements(node: Node) {
        return XML.xpathMaybeC('following-sibling::*')(MaybeT.of(node))
    }

    static newline(node: Node) {
        node
    }

    static nodeName(n: N) {
        return n.nodeName
    }

    static nodeValue(node: Node) {
        return MaybeT.of(node.nodeValue)
    }

    static nsResolver(prefix: string) {
        const ns = {
            't': 'http://www.tei-c.org/ns/1.0',
            'a': 'http://saxon.sf.net/',
            'xml': 'http://www.w3.org/XML/1998/namespace'
        }
        return ns[prefix] || null
    }

    static ownerDocument(node: Node) {
        return MaybeT.of<XMLDocument>(node.ownerDocument)
    }

    static ownerDocumentOfNodeOrDoc = (nodeOrDoc: Node | XMLDocument) => {
        const doc = XML.isDocument(nodeOrDoc) ?
            nodeOrDoc as XMLDocument:
            nodeOrDoc.ownerDocument

        return MaybeT.of(doc)
    }

    static parent(n: Node) {
        return MaybeT.of(n.parentNode)
    }

    static parents(node: Node) {
        function _parents(acc: Node[], _node: Maybe<Node>): Node[] {
            if (_node.value === null) {
                return acc
            }
            return _parents(
                Arr.concatMaybe ([_node]) (acc), 
                _node.bind(XML.parent)
            )
        }
        return _parents([], MaybeT.of(node.parentNode))
    }



    static previous = (node: Node) => {
        return (XML.xpathMaybeC("preceding::*") (MaybeT.of(node)).fromMaybe([]))        
    }

    static previousNode = (node: Node) => {
        return (XML.xpathMaybeC("preceding::node()") (MaybeT.of(node)).fromMaybe([]))        
    }

    static previousSibling = (node: Node) => {
        const sib = Arr.last (XML.xpathMaybeC("preceding-sibling::*") (MaybeT.of(node)).fromMaybe([]))
        return sib
    }

    static previousSiblings = (node: Node) => {
        return (XML.xpathMaybeC("preceding-sibling::*") (MaybeT.of(node)).fromMaybe([]))
    }

    static previousSiblingTextNodes(node: Node) {
        return XML.xpathMaybeC ('preceding-sibling::text()') (MaybeT.of(node))
            .fromMaybe([]) as Text[]
    }

    static previousTextNodes = (node: Node) => {
        return XML.xpathMaybeC("preceding::text()") (MaybeT.of(node))
            .fromMaybe([]) as Text[]
    }

    static previousTextNodesWithAncestorByAncestorId = 
        (ancestorName: string) => 
        (attrName: string) => 
        (attrVal: string) => 
        (node: Node) =>  {
            
        return XML.xpathMaybeC(`preceding::text()[ancestor::${ancestorName}[@${attrName}="${attrVal}"]]`) (MaybeT.of(node))
            .fromMaybe([]) as Text[]
    }


    static precedingTextNodesWithAncestorByAncestorName = 
        (ancestorName: string) => 
        (node: Node) =>  {
            
        return XML.xpathMaybeC(`preceding::text()[ancestor::${ancestorName}]`) (MaybeT.of(node))
            .fromMaybe([]) as Text[]
    }

    static buildRegExp = (genericTagRegExp: string) => (tagName: string) => {
        
        return new RegExp(genericTagRegExp.replace("{name}", tagName), "g")
    }

    static removeChild = (child: Node) => (parent: ParentNode) => {
        parent.removeChild(child)
        return parent
    }

    static removeChildById = (childId: string) => (parent: Node) => {
        const child = XML.childById (childId) (parent)
        const removeChild = child.fmap(XML.removeChild)
        MaybeT.of(parent).applyFmap(removeChild)
        return MaybeT.of(parent)
    }

    static replaceText = (pattern: string | RegExp) => (newText: string) => (textElem: Text) =>{
        textElem.textContent = MaybeT.of(textElem.textContent)
            .fmap(Str.replace (pattern) (newText))
            .unpack(textElem.textContent)
        return textElem
    } 

    static stripText = (textElem: Text) => {
        textElem.textContent = MaybeT.of(textElem.textContent)
            .fmap(Str.replace (/^[\s]+$/g) (""))
            .unpack(textElem.textContent)
        return textElem
    }

    static root(node: Node) {
        return node.getRootNode()
    }

    static get tagFragNames() {
        return Object.keys(XMLTagFragRegExps)
    }

    static otherTagFragments = (tagFragmentName: string) => {
        const tagIdx = MaybeT.ofNonNeg(XML.tagFragNames.findIndex( (x) => x === tagFragmentName ))
        return tagIdx
            .fmap(Arr.removeByIdx (XML.tagFragNames)) 
            .fromMaybe([])
    }

    static setAttr = (attrName: string) => (attrVal: string) => (n: HasXMLNode) => {
        n.setAttribute(attrName, attrVal)
        return n
    }

    static setId = (id: string) => (n: HasXMLNode) => {
        return XML.setAttr("id")(id)(n)
    }

    static tagNameFromTagStr = (tagStr: string) => {
        return Arr.head (Str.matches (XMLTagRegExps.tagWithNameGroup) (tagStr))
            .fmap(RegexMatchT.groups)
            .bind(Arr.head)
    }

    static textContent = (text: Text): Maybe<string> => {
        return MaybeT.of(text.textContent)
    }

    /**
     * Serialize an XML Node to a string representation,
     * using XMLSerializer().serializeToString
     * @param node 
     * @returns 
     */
    static toStr(node: Node) {
        return new XMLSerializer().serializeToString(node)
    }

    static xpathMaybeC(xpathstr: string) {
        function _xpath (xmldoc: Maybe<Node>): Maybe<Node[]> {
            return xmldoc   
                .bind(XML.xpathEval(xpathstr))
                .fmap(XML.xpathResultToNodeArr)
        }
        return _xpath
    }

    static xpathMaybe = (xpathstr: string) => (xmldoc: Maybe<Node>) => {
            return xmldoc
                .bind(XML.xpathEval(xpathstr))
                .fmap(XML.xpathResultToNodeArr)
    }

    static xpath = (xpathstr: string) => (node: Node) => {
        return MaybeT.of(node)   
            .bind(XML.xpathEval(xpathstr))
            .fmap(XML.xpathResultToNodeArr)
    }

    static xpathEval = (xpathstr:string) => (nodeOrDoc: Node | XMLDocument) => {
        return XML.ownerDocumentOfNodeOrDoc(nodeOrDoc)
            .fmap(XML._xpathEval (xpathstr) (nodeOrDoc))
    }

    static _xpathEval = (xpathstr: string) => (nodeOrDoc: XMLDocument | Node) => (owner: XMLDocument) => {
        return owner.evaluate(xpathstr, nodeOrDoc, XML.nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    }
    
    static xpathResultToNodeArr(xpathResult: XPathResult): Node[] {
        let results: Node[] = []
        const length = xpathResult.snapshotLength

        for (let i=0; i<length; i++) {
            const result = xpathResult.snapshotItem(i)
            
            if (result == null) {
                continue
            } else {
                results.push(result)
            }
            
        }

        return results
    }
}

type N = HasXMLNode | Node | XMLDocument | ParentNode