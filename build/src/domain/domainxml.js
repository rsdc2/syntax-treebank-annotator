// Methods shared between Arethusa and EpiDoc
var DXML;
(function (DXML) {
    DXML.isArtificial = (n) => {
        const node = DXML.node(n);
        return XML.hasAttr('artificial')(node);
    };
    function multiwordsFromArray(component) {
        return map(component.of);
    }
    DXML.multiwordsFromArray = multiwordsFromArray;
    function multiwordsFromXmlDoc(component, xmldoc) {
        const nodes = XML.xpathMaybe(component.xpathAddress)(xmldoc);
        const components = nodes.fmap(DXML.multiwordsFromArray(component));
        return maybe(new Array)(components);
    }
    DXML.multiwordsFromXmlDoc = multiwordsFromXmlDoc;
    /**
     *
     * @param n an object containing a Node object, e.g. ...
     * @returns the .node property of n, the object containing a Node object
     */
    function node(n) {
        return n._node;
    }
    DXML.node = node;
    DXML.nodeXMLStr = (n) => {
        return MaybeT.of(XML.toStr(n._node));
    };
    function wordsFromArray(component) {
        return map(component.of);
    }
    DXML.wordsFromArray = wordsFromArray;
    function wordsFromXmlDoc(component, xmlDocOrNode) {
        const nodes = XML.xpathMaybe(component.xpathAddress)(xmlDocOrNode);
        const components = nodes.fmap(DXML.wordsFromArray(component));
        return components.unpack(new Array);
    }
    DXML.wordsFromXmlDoc = wordsFromXmlDoc;
})(DXML || (DXML = {}));
