// Methods shared between Arethusa and EpiDoc
var DXML;
(function (DXML) {
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
    function node(n) {
        return n._node;
    }
    DXML.node = node;
    DXML.nodeXMLStr = (n) => {
        return MaybeT.of(n)
            .fmap(DXML.node)
            .fmap(XML.toStr);
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
