class ArethusaWord {
    constructor(node) {
        this._node = node;
    }
    static of(node) {
        return new ArethusaWord(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static get xpathAddress() {
        return "./treebank/sentence/word";
    }
}
ArethusaWord.id = (w) => {
    return XML.attr("id")(w._node)
        .bind(XML.nodeValue);
};
ArethusaWord.form = (w) => {
    return XML.attr("form")(w._node)
        .bind(XML.nodeValue);
};
ArethusaWord.createAttrs = (form) => {
    return {
        "form": form,
        "lemma": "",
        "postag": "",
        "relation": "",
        "head": "",
        "secdeps": ""
    };
};
ArethusaWord.matchId = (id) => (word) => {
    return ArethusaWord.id(word).unpack("") === id;
};
ArethusaWord.fromAttrs = (a) => (attrs) => {
    return a.doc
        .fmap(XML.createElement("word")(attrs))
        .fmap(ArethusaWord.fromXMLNode);
};
ArethusaWord.fromXMLNode = (node) => {
    return new ArethusaWord(node);
};
ArethusaWord.head = (w) => {
    return XML.attr("head")(w._node)
        .bind(XML.nodeValue);
};
ArethusaWord.lemma = (w) => {
    return XML.attr("lemma")(w._node)
        .bind(XML.nodeValue);
};
ArethusaWord.parentSentenceAddress = (wordId) => {
    return `./treebank/sentence[child::word[@id="${wordId}"]]`;
};
ArethusaWord.parentSentence = (word) => {
    return MaybeT.of(DXML.node(word))
        .bind(XML.parent)
        .fmap(ArethusaSentence.fromXMLNode);
};
ArethusaWord.parentSentenceId = (word) => {
    return ArethusaWord.parentSentence(word)
        .bind(ArethusaSentence.id);
};
ArethusaWord.postag = (w) => {
    return XML.attr("postag")(w._node)
        .bind(XML.nodeValue);
};
ArethusaWord.relation = (w) => {
    const rel = XML.attr("relation")(w._node)
        .bind(XML.nodeValue)
        .unpackT("");
    if (rel === "") {
        return ""; // Constants.defaultRel
    }
    return rel;
};
ArethusaWord.slashes = (w) => {
    const slashStr = XML.attr("secdeps")(w._node)
        .bind(XML.nodeValue)
        .unpackT("");
    if (slashStr === "")
        return new Array;
    const slashStrs = slashStr
        .split(";");
    return slashStrs.map(SecondaryDep.ofStr(ArethusaWord.id(w).unpackT("-1")));
};
ArethusaWord.toTreeToken = (w) => {
    return {
        form: ArethusaWord
            .form(w)
            .unpackT("[None]"),
        headId: ArethusaWord
            .head(w)
            .bind(Str.toMaybeNum)
            .unpackT(-1),
        id: ArethusaWord
            .id(w)
            .fmap(Str.toNum)
            .unpackT(-1),
        lemma: ArethusaWord
            .lemma(w)
            .unpackT("[None]"),
        postag: ArethusaWord
            .postag(w)
            .unpackT("[None]"),
        relation: ArethusaWord
            .relation(w),
        secondaryDeps: ArethusaWord
            .slashes(w),
        type: ArethusaWord
            .id(w).eq("0") ?
            TreeTokenType.Root :
            TreeTokenType.NonRoot,
    };
};
