class ArethusaToken {
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeThrow();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static of(node) {
        if (XML.hasAttr('artificial')(node)) {
            return ArethusaArtificial.of(node);
        }
        return new ArethusaToken(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    get corpusId() {
        return MaybeT.of(this._element.getAttribute("corpusId")).fromMaybe("");
    }
    static get xpathAddress() {
        return "./treebank/sentence/word";
    }
}
ArethusaToken.createAttrs = (form) => {
    return {
        "form": form,
        "relation": "",
        "head": "",
        "secdeps": "",
        "corpusId": ""
    };
};
ArethusaToken.form = (w) => {
    return XML.attr("form")(w._node)
        .bind(XML.nodeValue);
};
ArethusaToken.id = (w) => {
    return XML.attr("id")(w._node)
        .bind(XML.nodeValue);
};
ArethusaToken.isArtificial = (w) => {
    return MaybeT.of(w)
        .fmap(DXML.isArtificial)
        .fromMaybe(false);
};
ArethusaToken.matchId = (id) => (word) => {
    return ArethusaToken
        .id(word)
        .unpack("") === id;
};
ArethusaToken.fromAttrs = (a) => (attrs) => {
    return a.doc
        .fmap(XML.createElement("word")(attrs))
        .fmap(ArethusaToken.fromXMLNode);
};
ArethusaToken.fromXMLNode = (node) => {
    if (XML.hasAttr('artificial')) {
        return ArethusaArtificial.of(node);
    }
    return new ArethusaToken(node);
};
ArethusaToken.head = (w) => {
    return XML.attr("head")(w._node)
        .bind(XML.nodeValue);
};
ArethusaToken.parentSentence = (word) => {
    return MaybeT.of(DXML.node(word))
        .bind(XML.parent)
        .fmap(ArethusaSentence.fromXMLNode);
};
ArethusaToken.parentSentenceAddress = (wordId) => {
    return `./treebank/sentence[child::word[@id="${wordId}"]]`;
};
ArethusaToken.parentSentenceId = (word) => {
    return ArethusaToken
        .parentSentence(word)
        .bind(ArethusaSentence.id);
};
ArethusaToken.relation = (w) => {
    const rel = XML.attr("relation")(w._node)
        .bind(XML.nodeValue)
        .fromMaybe("");
    if (rel === "") {
        return ""; // Constants.defaultRel
    }
    return rel;
};
ArethusaToken.secondaryDeps = (w) => {
    const secondaryDepStr = XML.attr("secdeps")(w._node)
        .bind(XML.nodeValue)
        .fromMaybe("");
    if (secondaryDepStr === "")
        return new Array;
    const secondaryDepStrs = secondaryDepStr
        .split(";");
    return secondaryDepStrs.map(SecondaryDep.ofStr(ArethusaToken.id(w).fromMaybe("-1")));
};
ArethusaToken.treeTokenType = (w) => {
    if (ArethusaToken.id(w).eq("0")) {
        return TreeTokenType.Root;
    }
    return TreeTokenType.NonRoot;
};
ArethusaToken.toTreeToken = (w) => {
    if (ArethusaToken.isArtificial(w)) {
        return ArethusaArtificial.toTreeToken(w);
    }
    return ArethusaWord.toTreeToken(w);
};
