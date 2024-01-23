class ArethusaToken {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static createAttrs = (form) => {
        return {
            "form": form,
            "leiden": "",
            "relation": "",
            "head": "",
            "secdeps": "",
            "corpusId": ""
        };
    };
    static form = (w) => {
        return XML.attr("form")(w._node)
            .bind(XML.nodeValue);
    };
    get form() {
        return ArethusaToken.form(this);
    }
    static id = (w) => {
        return XML.attr("id")(w._node)
            .bind(XML.nodeValue);
    };
    static isArtificial = (w) => {
        return MaybeT.of(w)
            .fmap(DXML.isArtificial)
            .fromMaybe(false);
    };
    get leiden() {
        return ArethusaToken.leiden(this);
    }
    static leiden = (w) => {
        return XML.attr("leiden")(w._node)
            .bind(XML.nodeValue);
    };
    static matchId = (id) => (word) => {
        return ArethusaToken
            .id(word)
            .unpack("") === id;
    };
    static of(node) {
        if (XML.hasAttr('artificial')(node)) {
            return ArethusaArtificial.of(node);
        }
        return new ArethusaToken(node);
    }
    static fromAttrs = (a) => (attrs) => {
        return a.doc
            .fmap(XML.createElement("word")(attrs))
            .fmap(ArethusaToken.fromXMLNode);
    };
    static fromXMLNode = (node) => {
        if (XML.hasAttr('artificial')) {
            return ArethusaArtificial.of(node);
        }
        return new ArethusaToken(node);
    };
    static head = (w) => {
        return XML.attr("head")(w._node)
            .bind(XML.nodeValue);
    };
    static parentSentence = (word) => {
        return MaybeT.of(DXML.node(word))
            .bind(XML.parent)
            .fmap(ArethusaSentence.fromXMLNode);
    };
    static parentSentenceAddress = (wordId) => {
        return `./treebank/sentence[child::word[@id="${wordId}"]]`;
    };
    static parentSentenceId = (word) => {
        return ArethusaToken
            .parentSentence(word)
            .bind(ArethusaSentence.id);
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
    // Removes tokens with no text
    static removeEmptyTokens = (tokens) => {
        return tokens
            .reduce((acc, token) => {
            if (token.form.unpack("") === "") {
                return acc;
            }
            return [...acc, token];
        }, new Array());
    };
    static secondaryDeps = (w) => {
        const secondaryDepStr = XML.attr("secdeps")(w._node)
            .bind(XML.nodeValue)
            .fromMaybe("");
        if (secondaryDepStr === "")
            return new Array;
        const secondaryDepStrs = secondaryDepStr
            .split(";");
        return secondaryDepStrs.map(SecondaryDep.ofStr(ArethusaToken.id(w).fromMaybe("-1")));
    };
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static treeTokenType = (w) => {
        if (ArethusaToken.id(w).eq("0")) {
            return TreeTokenType.Root;
        }
        return TreeTokenType.NonRoot;
    };
    static toTreeToken = (w) => {
        if (ArethusaToken.isArtificial(w)) {
            return ArethusaArtificial.toTreeToken(w);
        }
        return ArethusaWord.toTreeToken(w);
    };
    get corpusId() {
        return MaybeT.of(this._element.getAttribute("corpusId")).fromMaybe("");
    }
    static get xpathAddress() {
        return "./treebank/sentence/word";
    }
}
