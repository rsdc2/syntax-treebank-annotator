var DOM;
(function (DOM) {
    let Attr;
    (function (Attr) {
        Attr.value = (attr) => attr.value;
    })(Attr = DOM.Attr || (DOM.Attr = {}));
    let Elem;
    (function (Elem) {
        Elem.attributes = (e) => { return e.attributes; };
    })(Elem = DOM.Elem || (DOM.Elem = {}));
    let Node_;
    (function (Node_) {
        Node_.element = (n) => {
            if (n.nodeType === Node.ELEMENT_NODE) {
                return MaybeT.of(n);
            }
            else if (n.nodeType === Node.DOCUMENT_NODE) {
                return MaybeT.of(n['documentElement']);
            }
            return Nothing.of();
        };
    })(Node_ = DOM.Node_ || (DOM.Node_ = {}));
    let NamedNodeMap;
    (function (NamedNodeMap) {
        NamedNodeMap.getNamedItem = (qualifiedName) => (m) => {
            return MaybeT.of(m.getNamedItem(qualifiedName));
        };
        function getNamedItemNS(namespace, localName, m) {
            return MaybeT.of(m.getNamedItemNS(namespace, localName));
        }
        NamedNodeMap.getNamedItemNS = getNamedItemNS;
    })(NamedNodeMap = DOM.NamedNodeMap || (DOM.NamedNodeMap = {}));
})(DOM || (DOM = {}));
