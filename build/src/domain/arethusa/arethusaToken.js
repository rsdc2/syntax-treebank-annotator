class ArethusaToken {
    constructor(node) {
        this._node = node;
    }
    static of(node) {
        return new ArethusaToken(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static get xpathAddress() {
        return "./treebank/sentence/word";
    }
}
ArethusaToken.id = (w) => {
    return XML.attr("id")(w._node)
        .bind(XML.nodeValue);
};
ArethusaToken.form = (w) => {
    return XML.attr("form")(w._node)
        .bind(XML.nodeValue);
};
ArethusaToken.createAttrs = (form) => {
    return {
        "form": form,
        "relation": "",
        "head": "",
        "secdeps": ""
    };
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
    return new ArethusaToken(node);
};
ArethusaToken.head = (w) => {
    return XML.attr("head")(w._node)
        .bind(XML.nodeValue);
};
ArethusaToken.parentSentenceAddress = (wordId) => {
    return `./treebank/sentence[child::word[@id="${wordId}"]]`;
};
ArethusaToken.parentSentence = (word) => {
    return MaybeT.of(DXML.node(word))
        .bind(XML.parent)
        .fmap(ArethusaSentence.fromXMLNode);
};
ArethusaToken.parentSentenceId = (word) => {
    return ArethusaToken
        .parentSentence(word)
        .bind(ArethusaSentence.id);
};
ArethusaToken.relation = (w) => {
    const rel = XML.attr("relation")(w._node)
        .bind(XML.nodeValue)
        .unpackT("");
    if (rel === "") {
        return ""; // Constants.defaultRel
    }
    return rel;
};
ArethusaToken.secondaryDeps = (w) => {
    const secondaryDepStr = XML.attr("secdeps")(w._node)
        .bind(XML.nodeValue)
        .unpackT("");
    if (secondaryDepStr === "")
        return new Array;
    const secondaryDepStrs = secondaryDepStr
        .split(";");
    return secondaryDepStrs.map(SecondaryDep.ofStr(ArethusaToken.id(w).unpackT("-1")));
};
ArethusaToken.treeTokenType = (w) => {
    if (ArethusaToken.id(w).eq("0")) {
        return TreeTokenType.Root;
    }
    const hasLemma = MaybeT.of(w)
        .fmap(DXML.node)
        .fmap(XML.hasAttr('lemma'))
        .unpackT(false);
    if (hasLemma) {
        return TreeTokenType.NonRoot;
    }
    else {
        return TreeTokenType.Artificial;
    }
};
ArethusaToken.toTreeToken = (w) => {
    if (ArethusaToken.treeTokenType(w) === TreeTokenType.Artificial) {
        console.log("To artificial token");
        return ArethusaArtificial.toTreeToken(w);
    }
    console.log("To word token");
    return ArethusaWord.toTreeToken(w);
};
