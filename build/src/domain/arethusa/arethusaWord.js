class ArethusaWord {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static id = (w) => {
        return XML.attr("id")(w._node)
            .bind(XML.nodeValue);
    };
    static form = (w) => {
        return XML.attr("form")(w._node)
            .bind(XML.nodeValue)
            .fmap(Str.replace(/\n/g)(""));
    };
    get form() {
        return ArethusaToken.form(this);
    }
    static createAttrs = (form) => {
        return {
            "form": form,
            "leiden": "",
            "lemma": "",
            "postag": "",
            "upos": "",
            "relation": "",
            "head": "",
            "secdeps": "",
            "corpusId": ""
        };
    };
    get leiden() {
        return ArethusaToken.leiden(this);
    }
    static leiden = (w) => {
        return XML.attr("leiden")(w._node)
            .bind(XML.nodeValue);
    };
    static matchId = (id) => (word) => {
        return ArethusaWord.id(word).fromMaybe("") === id;
    };
    static of(node) {
        return new ArethusaWord(node);
    }
    static fromAttrs = (a) => (attrs) => {
        return a.doc
            .fmap(XML.createElement("word")(attrs))
            .fmap(ArethusaWord.fromXMLNode);
    };
    static fromXMLNode = (node) => {
        return new ArethusaWord(node);
    };
    static head = (w) => {
        return XML.attr("head")(w._node)
            .bind(XML.nodeValue);
    };
    static lemma = (w) => {
        return XML.attr("lemma")(w._node)
            .bind(XML.nodeValue);
    };
    static parentSentenceAddress = (wordId) => {
        return `./treebank/sentence[child::word[@id="${wordId}"]]`;
    };
    static parentSentence = (word) => {
        return MaybeT.of(DXML.node(word))
            .bind(XML.parent)
            .fmap(ArethusaSentence.fromXMLNode);
    };
    static parentSentenceId = (word) => {
        return ArethusaWord.parentSentence(word)
            .bind(ArethusaSentence.id);
    };
    static postag = (w) => {
        return XML.attr("postag")(w._node)
            .bind(XML.nodeValue);
    };
    static feats = (w) => {
        return XML.attr("feats")(w._node)
            .bind(XML.nodeValue);
    };
    static relation = (w) => {
        const rel = XML.attr("relation")(w._node)
            .bind(XML.nodeValue)
            .fromMaybe("");
        if (rel === "") {
            return ""; // Constants.defaultRel
        }
        return rel;
    };
    static slashes = (w) => {
        const slashStr = XML.attr("secdeps")(w._node)
            .bind(XML.nodeValue)
            .fromMaybe("");
        if (slashStr === "")
            return new Array;
        const slashStrs = slashStr
            .split(";");
        return slashStrs.map(SecondaryDep.ofStr(ArethusaWord.id(w).fromMaybe("-1")));
    };
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static toTreeToken = (w) => {
        return {
            form: ArethusaWord
                .form(w)
                .fromMaybe(""),
            leiden: ArethusaWord
                .leiden(w)
                .fromMaybe(""),
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
            upos: ArethusaWord
                .upos(w)
                .fromMaybe(""),
            feats: ArethusaWord
                .feats(w)
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
    get corpusId() {
        return MaybeT.of(this._element.getAttribute("corpusId")).fromMaybe("");
    }
    static upos = (w) => {
        return XML.attr("upos")(w._node)
            .bind(XML.nodeValue);
    };
    static get xpathAddress() {
        return "./treebank/sentence/word";
    }
}
