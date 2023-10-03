class ArethusaWord {
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static of(node) {
        return new ArethusaWord(node);
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
ArethusaWord.id = (w) => {
    return XML.attr("id")(w._node)
        .bind(XML.nodeValue);
};
ArethusaWord.form = (w) => {
    return XML.attr("form")(w._node)
        .bind(XML.nodeValue)
        .fmap(Str.replace(/\n/g)(""));
};
ArethusaWord.createAttrs = (form) => {
    return {
        "form": form,
        "lemma": "",
        "postag": "",
        "relation": "",
        "head": "",
        "secdeps": "",
        "corpusId": ""
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
        .fromMaybe("");
    if (rel === "") {
        return ""; // Constants.defaultRel
    }
    return rel;
};
ArethusaWord.slashes = (w) => {
    const slashStr = XML.attr("secdeps")(w._node)
        .bind(XML.nodeValue)
        .fromMaybe("");
    if (slashStr === "")
        return new Array;
    const slashStrs = slashStr
        .split(";");
    return slashStrs.map(SecondaryDep.ofStr(ArethusaWord.id(w).fromMaybe("-1")));
};
ArethusaWord.toTreeToken = (w) => {
    return {
        form: ArethusaWord
            .form(w)
            .fromMaybe("[None]"),
        headId: ArethusaWord
            .head(w)
            .bind(Str.toMaybeNum)
            .fromMaybe(-1),
        id: ArethusaWord
            .id(w)
            .fmap(Str.toNum)
            .fromMaybe(-1),
        lemma: ArethusaWord
            .lemma(w)
            .fromMaybe(""),
        postag: ArethusaWord
            .postag(w)
            .fromMaybe(""),
        relation: ArethusaWord
            .relation(w),
        secondaryDeps: ArethusaWord
            .slashes(w),
        type: ArethusaWord
            .id(w).eq("0") ?
            TreeTokenType.Root :
            TreeTokenType.NonRoot,
        corpusId: w.corpusId
    };
};
