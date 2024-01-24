class HasNodeT {
    static element(n) {
        if (n._node.nodeType === Node.ELEMENT_NODE) {
            return MaybeT.of(n._node);
        }
        return Nothing.of();
    }
    static node(n) {
        return n._node;
    }
}
class HasFormT {
    static form(f) {
        return f.text;
    }
}
class HasTokensT {
    static tokens(tokenable) {
        return tokenable.tokens;
    }
}
class Word {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(this._node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static of(node) {
        return new Word(node);
    }
    static get xpathAddress() {
        return ".//";
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
}
class Multiword {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(this._node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static of(node) {
        return new Multiword(node);
    }
    static get xpathAddress() {
        return ".//";
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    get tokens() {
        return [];
    }
}
class XML {
    static _appendDocElement(xmldoc, element) {
        return MaybeT.of(xmldoc)
            .bind(XML.firstDocChild)
            .bind(XML.appendElementToNode(element))
            .bind(XML.ownerDocument);
    }
    static appendToDocElement(xmldoc) {
        function _appendToDoc(element) {
            return XML._appendDocElement(xmldoc, element);
        }
        return _appendToDoc;
    }
    static appendElementToDoc(element) {
        function _appendToDoc(xmldoc) {
            return XML._appendDocElement(xmldoc, element);
        }
        return _appendToDoc;
    }
    static _appendDocElementPretty(xmldoc, element) {
        return MaybeT.of(xmldoc)
            .bind(XML.firstDocChild)
            .bind(XML.appendElementToNode(element))
            .bind(XML.appendTextToNode("\n"))
            .bind(XML.ownerDocument);
    }
    static appendElementToDocPretty(element) {
        function _appendToDoc(xmldoc) {
            return XML._appendDocElementPretty(xmldoc, element);
        }
        return _appendToDoc;
    }
    static appendToDocElementPretty(xmldoc) {
        function _appendToDoc(element) {
            return XML._appendDocElementPretty(xmldoc, element);
        }
        return _appendToDoc;
    }
    static appendElementToNode(element) {
        function _appendToNode(node) {
            return element
                .bind(XML.appendToNodeChild(node));
        }
        return _appendToNode;
    }
    static _appendElementNodePretty(element, node) {
        return MaybeT.of(node)
            .bind(XML.appendTextToNode('\t'))
            .applyBind(element.fmap(XML.appendChildToNode))
            .bind(XML.appendTextToNode('\n'));
    }
    static appendElementToNodePretty(element) {
        function _appendToNode(node) {
            return XML._appendElementNodePretty(element, node);
        }
        return _appendToNode;
    }
    static _appendNodeChild(parent, child) {
        return MaybeT.of(parent.appendChild(child))
            .bind(XML.parent);
    }
    static appendToNodeChild(parent) {
        function _appendChild(child) {
            return XML._appendNodeChild(parent, child);
        }
        return _appendChild;
    }
    static appendChildToNode = (child) => (parent) => {
        return XML._appendNodeChild(parent, child);
    };
    static prependChildToNode = (child) => (parent) => {
        // NB! Insert before deep copies the child
        parent.firstChild === null ?
            XML.appendChildToNode(child)(parent) :
            XML.insertBefore(child)(parent.firstChild);
        return parent;
    };
    static appendChildrenToNode = (children) => (parent) => {
        return children.reduce((acc, sentNode) => {
            return acc.bind(XML.appendChildToNode(sentNode));
        }, MaybeT.of(parent));
    };
    static _appendNodeText(node, s) {
        const textelem = MaybeT.of(node.ownerDocument)
            .fmap(XML.createTextElementFromDoc(s));
        return textelem.bind(XML.appendToNodeChild(node));
    }
    static appendToNodeText(node) {
        function _appendChild(s) {
            return XML._appendNodeText(node, s);
        }
        return _appendChild;
    }
    static appendTextToNode(s) {
        function _appendChild(node) {
            return XML._appendNodeText(node, s);
        }
        return _appendChild;
    }
    static attr = (attrName) => (node) => {
        return MaybeT.of(XML.attrs(node)[attrName]);
    };
    static attrs(node) {
        return XML
            .xpathMaybeC("attribute::*")(MaybeT.of(node))
            .fromMaybe([])
            .reduce((acc, item) => {
            acc[item.nodeName] = item;
            return acc;
        }, {});
    }
    static attrVal(attrName) {
        function _attr(node) {
            return MaybeT.of(XML.attrs(node)[attrName]).bind(XML.nodeValue);
        }
        return _attr;
    }
    static childById = (id) => (parent) => {
        const children = XML.xpathMaybeC(`child::*[@id="${id}"]`)(MaybeT.of(parent));
        return children.bind(Arr.head);
    };
    static childNodes = (node) => {
        let _nodes = [];
        node.childNodes.forEach((node) => {
            _nodes.push(node);
        });
        return _nodes;
    };
    static childNodesByTagName = (tagName) => (node) => {
        let _nodes = [];
        node.childNodes.forEach((node) => {
            if (node.nodeName === tagName) {
                _nodes.push(node);
            }
        });
        return _nodes;
    };
    static concatText = (textNodes) => {
        return textNodes.map(XML.textContent).join("");
    };
    static createElement = (elementName) => (attrs) => (xmldoc) => {
        const e = xmldoc.createElement(elementName);
        Object.keys(attrs).forEach(k => {
            e.setAttribute(k, attrs[k]);
        });
        return e;
    };
    static createTextElementFromDoc(text) {
        function _createElement(xmldoc) {
            return xmldoc.createTextNode(text);
        }
        return _createElement;
    }
    static createTextElementFromNode(text) {
        function _createElement(node) {
            const doc = MaybeT.of(node).bind(XML.ownerDocument);
            return doc.fmap(XML.createTextElementFromDoc(text));
        }
        return _createElement;
    }
    static deepcopy(node) {
        return node.cloneNode(true);
    }
    static depth(node) {
        function _getParent(_node, counter) {
            const parent = _node.bind(XML.parent);
            const parentIsRoot = parent
                .fmap(XML.isRoot)
                .unpack(false);
            if (parentIsRoot) {
                return counter;
            }
            return _getParent(parent, counter += 1);
        }
        return _getParent(MaybeT.of(node), 0);
    }
    static descendantById = (id) => (node) => {
        return XML.xpathMaybeC(`descendant::*[@id="${id}"]`)(MaybeT.of(node))
            .bind(Arr.head);
    };
    static descendants(node) {
        return XML.xpathMaybeC('descendant::*')(MaybeT.of(node));
    }
    static descendantsOrSelf(node) {
        return XML.xpathMaybeC('descendant-or-self::*')(MaybeT.of(node));
    }
    static descendantTextNodes(node) {
        return XML.xpathMaybeC('descendant::text()')(MaybeT.of(node));
    }
    static documentElement(xmldoc) {
        return MaybeT.of(xmldoc.documentElement);
    }
    static docElement(doc) {
        return doc.documentElement;
    }
    static firstChild(node) {
        return MaybeT.of(node.firstChild);
    }
    static firstDocChild(doc) {
        return MaybeT.of(doc.firstChild);
    }
    static followingTextNodesWithAncestorByAncestorId = (ancestorName) => (attrName) => (attrVal) => (node) => {
        return XML.xpathMaybeC(`following::text()[ancestor::${ancestorName}[@${attrName}="${attrVal}"]]`)(MaybeT.of(node))
            .fromMaybe([]);
    };
    static followingTextNodesWithAncestorByAncestorName = (ancestorName) => (node) => {
        return XML.xpathMaybeC(`following::text()[ancestor::${ancestorName}]`)(MaybeT.of(node))
            .fromMaybe([]);
    };
    static fromXMLStr(xml) {
        if (xml === '') {
            return new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><empty/>', "application/xml");
        }
        // if (xml.includes("error")) {
        //     return new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><empty/>', "application/xml")
        // }
        if (xml === "<empty/>") {
            return new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><empty/>', "application/xml");
        }
        // return new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><empty/>', "application/xml")
        // try {
        const result = new DOMParser()
            .parseFromString(xml, "application/xml");
        if (result.querySelector("parsererror")) {
            console.log("Parser error");
        }
        return result;
        // } catch (error) {
        //     return new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><empty/>', "application/xml")
        // }
    }
    static getAttrVal = (namespace) => (localName) => (token) => {
        const attrs = token.attrs;
        return DOM.NamedNodeMap
            .getNamedItemNS(namespace, localName, attrs)
            .fmap(DOM.Attr.value);
    };
    static hasAncestor = (tagName) => (node) => {
        const ancestors = XML
            .xpath(`ancestor::t:${tagName}`)(node)
            .fromMaybe([]);
        return ancestors.length > 0;
    };
    static hasAttr(attr) {
        function _hasAttr(node) {
            const attributes = XML.xpathMaybeC(`attribute::${attr}`)(MaybeT.of(node)).fromMaybe([]);
            return attributes.length > 0;
        }
        return _hasAttr;
    }
    static hasAttrVal(attrName) {
        function _hasAttr(value) {
            function __hasAttr(node) {
                return XML.attr(attrName)(node)
                    .bind(XML.nodeValue)
                    .unpack("") === value;
            }
            return __hasAttr;
        }
        return _hasAttr;
    }
    static _insertBefore(nodeToInsert) {
        function __insertBefore(refNode) {
            function ___insertBefore(parentNode) {
                return parentNode.insertBefore(nodeToInsert, refNode);
            }
            return ___insertBefore;
        }
        return __insertBefore;
    }
    static insertBefore = (nodeToInsert) => (refNode) => {
        function _insertBefore(parentNode) {
            const _nodeToInsert = XML.deepcopy(nodeToInsert);
            const insertNewNode = MaybeT.of(refNode)
                .fmap(XML._insertBefore(_nodeToInsert));
            const insertedNode = parentNode
                .applyFmap(insertNewNode);
            return insertedNode
                .bind(XML.parent);
        }
        const _parentNode = MaybeT.of(refNode).bind(XML.parent);
        return _insertBefore(_parentNode);
    };
    static insertAfter = (nodeToInsert) => (refNode) => {
        const _refNode = MaybeT.of(refNode.nextSibling);
        const parentNode = MaybeT.of(refNode).bind(XML.parent);
        // Need to get the value out of _refNode because 
        // if the reference node is null, the method
        // .insertBefore automatically inserts the node last
        // see https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
        const insertNewNode = XML._insertBefore(nodeToInsert)(_refNode.value);
        const insertedNode = parentNode.fmap(insertNewNode);
        return insertedNode.bind(XML.parent);
    };
    static isDocument(node) {
        return node.nodeName === "#document";
    }
    static isParseError(doc) {
        return doc.firstChild?.nodeName === "html";
    }
    static isRoot(node) {
        return node === node.getRootNode();
    }
    static isTop(node) {
        const nodeName = MaybeT.of(node.parentNode)
            .fmap(XML.nodeName).value;
        return nodeName === '#document' || nodeName === null;
    }
    static lastChild(node) {
        return MaybeT.of(node.lastChild);
    }
    static next = (node) => {
        return (XML.xpathMaybeC("following::*")(MaybeT.of(node)).fromMaybe([]));
    };
    static nextNode = (node) => {
        return (XML.xpathMaybeC("following::node()")(MaybeT.of(node)).fromMaybe([]));
    };
    static nextSibling = (node) => {
        return Arr.head(XML.xpathMaybeC("following-sibling::*")(MaybeT.of(node)).fromMaybe([]));
    };
    static nextSiblingElements(node) {
        return XML.xpathMaybeC('following-sibling::*')(MaybeT.of(node));
    }
    static newline(node) {
        node;
    }
    static nodeName(n) {
        return n.nodeName;
    }
    static nodeValue(node) {
        return MaybeT.of(node.nodeValue);
    }
    static nsResolver(prefix) {
        const ns = {
            't': 'http://www.tei-c.org/ns/1.0',
            'a': 'http://saxon.sf.net/',
            'xml': 'http://www.w3.org/XML/1998/namespace'
        };
        return ns[prefix] || null;
    }
    static ownerDocument(node) {
        return MaybeT.of(node.ownerDocument);
    }
    static ownerDocumentOfNodeOrDoc = (nodeOrDoc) => {
        const doc = XML.isDocument(nodeOrDoc) ?
            nodeOrDoc :
            nodeOrDoc.ownerDocument;
        return MaybeT.of(doc);
    };
    static parent(n) {
        return MaybeT.of(n.parentNode);
    }
    static parents(node) {
        function _parents(acc, _node) {
            if (_node.value === null) {
                return acc;
            }
            return _parents(Arr.concatMaybe([_node])(acc), _node.bind(XML.parent));
        }
        return _parents([], MaybeT.of(node.parentNode));
    }
    static previous = (node) => {
        return (XML.xpathMaybeC("preceding::*")(MaybeT.of(node)).fromMaybe([]));
    };
    static previousNode = (node) => {
        return (XML.xpathMaybeC("preceding::node()")(MaybeT.of(node)).fromMaybe([]));
    };
    static previousSibling = (node) => {
        const sib = Arr.last(XML.xpathMaybeC("preceding-sibling::*")(MaybeT.of(node)).fromMaybe([]));
        return sib;
    };
    static previousSiblings = (node) => {
        return (XML.xpathMaybeC("preceding-sibling::*")(MaybeT.of(node)).fromMaybe([]));
    };
    static previousSiblingTextNodes(node) {
        return XML.xpathMaybeC('preceding-sibling::text()')(MaybeT.of(node))
            .fromMaybe([]);
    }
    static previousTextNodes = (node) => {
        return XML.xpathMaybeC("preceding::text()")(MaybeT.of(node))
            .fromMaybe([]);
    };
    static previousTextNodesWithAncestorByAncestorId = (ancestorName) => (attrName) => (attrVal) => (node) => {
        return XML.xpathMaybeC(`preceding::text()[ancestor::${ancestorName}[@${attrName}="${attrVal}"]]`)(MaybeT.of(node))
            .fromMaybe([]);
    };
    static precedingTextNodesWithAncestorByAncestorName = (ancestorName) => (node) => {
        return XML.xpathMaybeC(`preceding::text()[ancestor::${ancestorName}]`)(MaybeT.of(node))
            .fromMaybe([]);
    };
    static buildRegExp = (genericTagRegExp) => (tagName) => {
        return new RegExp(genericTagRegExp.replace("{name}", tagName), "g");
    };
    static removeChild = (child) => (parent) => {
        parent.removeChild(child);
        return parent;
    };
    static removeChildById = (childId) => (parent) => {
        const child = XML.childById(childId)(parent);
        const removeChild = child.fmap(XML.removeChild);
        MaybeT.of(parent).applyFmap(removeChild);
        return MaybeT.of(parent);
    };
    static replaceText = (pattern) => (newText) => (textElem) => {
        textElem.textContent = MaybeT.of(textElem.textContent)
            .fmap(Str.replace(pattern)(newText))
            .unpack(textElem.textContent);
        return textElem;
    };
    static stripText = (textElem) => {
        textElem.textContent = MaybeT.of(textElem.textContent)
            .fmap(Str.replace(/^[\s]+$/g)(""))
            .unpack(textElem.textContent);
        return textElem;
    };
    static root(node) {
        return node.getRootNode();
    }
    static get tagFragNames() {
        return Object.keys(XMLTagFragRegExps);
    }
    static otherTagFragments = (tagFragmentName) => {
        const tagIdx = MaybeT.ofNonNeg(XML.tagFragNames.findIndex((x) => x === tagFragmentName));
        return tagIdx
            .fmap(Arr.removeByIdx(XML.tagFragNames))
            .fromMaybe([]);
    };
    static setAttr = (attrName) => (attrVal) => (n) => {
        n.setAttribute(attrName, attrVal);
        return n;
    };
    static setId = (id) => (n) => {
        return XML.setAttr("id")(id)(n);
    };
    static tagNameFromTagStr = (tagStr) => {
        return Arr.head(Str.matches(XMLTagRegExps.tagWithNameGroup)(tagStr))
            .fmap(RegexMatchT.groups)
            .bind(Arr.head);
    };
    static textContent = (text) => {
        return MaybeT.of(text.textContent);
    };
    static toStr(root) {
        return new XMLSerializer().serializeToString(root);
    }
    static xpathMaybeC(xpathstr) {
        function _xpath(xmldoc) {
            return xmldoc
                .bind(XML.xpathEval(xpathstr))
                .fmap(XML.xpathResultToNodeArr);
        }
        return _xpath;
    }
    static xpathMaybe = (xpathstr) => (xmldoc) => {
        return xmldoc
            .bind(XML.xpathEval(xpathstr))
            .fmap(XML.xpathResultToNodeArr);
    };
    static xpath = (xpathstr) => (node) => {
        return MaybeT.of(node)
            .bind(XML.xpathEval(xpathstr))
            .fmap(XML.xpathResultToNodeArr);
    };
    static xpathEval = (xpathstr) => (nodeOrDoc) => {
        return XML.ownerDocumentOfNodeOrDoc(nodeOrDoc)
            .fmap(XML._xpathEval(xpathstr)(nodeOrDoc));
    };
    static _xpathEval = (xpathstr) => (nodeOrDoc) => (owner) => {
        return owner.evaluate(xpathstr, nodeOrDoc, XML.nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    };
    static xpathResultToNodeArr(xpathResult) {
        let results = [];
        const length = xpathResult.snapshotLength;
        for (let i = 0; i < length; i++) {
            const result = xpathResult.snapshotItem(i);
            if (result == null) {
                continue;
            }
            else {
                results.push(result);
            }
        }
        return results;
    }
}
