/**
 * Implements the Arethusa Artificial Token.
 * As a separate class from ArethusaArtificial this
 * is not used in this annotator.
 * It is implemented for comptatibility with
 * Arethusa.
 */
class ArethusaArtificial {
    constructor(node) {
        this._node = node;
    }
    static of(node) {
        return new ArethusaArtificial(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static get xpathAddress() {
        return './treebank/sentence/word[@lemma]';
    }
}
ArethusaArtificial.id = (w) => {
    return XML.attr("id")(w._node)
        .bind(XML.nodeValue);
};
ArethusaArtificial.form = (w) => {
    return XML.attr("form")(w._node)
        .bind(XML.nodeValue);
};
ArethusaArtificial.createAttrs = (form) => {
    return {
        "form": form,
        "artificial": "elliptic",
        "insertion_id": "",
        "relation": "",
        "head": "",
        "secdeps": ""
    };
};
ArethusaArtificial.matchId = (id) => (word) => {
    return ArethusaArtificial.id(word).unpack("") === id;
};
ArethusaArtificial.fromAttrs = (a) => (attrs) => {
    return a.doc
        .fmap(XML.createElement("word")(attrs))
        .fmap(ArethusaArtificial.fromXMLNode);
};
ArethusaArtificial.fromXMLNode = (node) => {
    return new ArethusaArtificial(node);
};
ArethusaArtificial.head = (w) => {
    return XML.attr("head")(w._node)
        .bind(XML.nodeValue);
};
ArethusaArtificial.parentSentenceAddress = (wordId) => {
    return `./treebank/sentence[child::word[@id="${wordId}"]]`;
};
ArethusaArtificial.parentSentence = (word) => {
    return MaybeT.of(DXML.node(word))
        .bind(XML.parent)
        .fmap(ArethusaSentence.fromXMLNode);
};
ArethusaArtificial.parentSentenceId = (word) => {
    return ArethusaArtificial.parentSentence(word)
        .bind(ArethusaSentence.id);
};
ArethusaArtificial.relation = (w) => {
    const rel = XML.attr("relation")(w._node)
        .bind(XML.nodeValue)
        .unpackT("");
    if (rel === "") {
        return ""; // Constants.defaultRel
    }
    return rel;
};
ArethusaArtificial.secondaryDeps = (w) => {
    const slashStr = XML.attr("secdeps")(w._node)
        .bind(XML.nodeValue)
        .unpackT("");
    if (slashStr === "")
        return new Array;
    const slashStrs = slashStr
        .split(";");
    return slashStrs.map(Slash.ofStr(ArethusaArtificial.id(w).unpackT("-1")));
};
ArethusaArtificial.toTreeToken = (w) => {
    return {
        form: ArethusaArtificial
            .form(w)
            .unpackT("[None]"),
        headId: ArethusaArtificial
            .head(w)
            .bind(Str.toMaybeNum)
            .unpackT(-1),
        id: ArethusaArtificial
            .id(w)
            .fmap(Str.toNum)
            .unpackT(-1),
        lemma: "[None]",
        postag: "[None]",
        relation: ArethusaArtificial
            .relation(w),
        slashes: ArethusaArtificial
            .secondaryDeps(w),
        type: ArethusaArtificial
            .id(w).eq("0") ?
            TokenType.Root :
            TokenType.NonRoot,
    };
};
