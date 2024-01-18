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
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    get form() {
        return ArethusaToken.form(this);
    }
    get leiden() {
        return ArethusaToken.leiden(this);
    }
    static of(node) {
        return new ArethusaArtificial(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    get corpusId() {
        return MaybeT.of(this._element.getAttribute("corpusId")).fromMaybe("");
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
        "leiden": "",
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
        .fromMaybe("");
    if (rel === "") {
        return ""; // Constants.defaultRel
    }
    return rel;
};
ArethusaArtificial.secondaryDeps = (w) => {
    const slashStr = XML.attr("secdeps")(w._node)
        .bind(XML.nodeValue)
        .fromMaybe("");
    if (slashStr === "")
        return new Array;
    const slashStrs = slashStr
        .split(";");
    return slashStrs.map(SecondaryDep.ofStr(ArethusaArtificial.id(w).fromMaybe("-1")));
};
ArethusaArtificial.toTreeToken = (w) => {
    return {
        form: ArethusaArtificial
            .form(w)
            .fromMaybe(""),
        leiden: ArethusaArtificial
            .form(w)
            .fromMaybe(""),
        headId: ArethusaArtificial
            .head(w)
            .bind(Str.toMaybeNum)
            .fromMaybe(-1),
        id: ArethusaArtificial
            .id(w)
            .fmap(Str.toNum)
            .fromMaybe(-1),
        artificial: "elliptical",
        insertionId: "",
        relation: ArethusaArtificial
            .relation(w),
        secondaryDeps: ArethusaArtificial
            .secondaryDeps(w),
        type: ArethusaArtificial
            .id(w).eq("0") ?
            TreeTokenType.Root :
            TreeTokenType.NonRoot,
        corpusId: w.corpusId
    };
};
