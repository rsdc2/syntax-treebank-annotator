class ArethusaSentence {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    static appendArtificialToSentenceFromAttrs = (attrs) => (sentence) => {
        const arethusa = ArethusaDoc
            .parentArethusa(sentence);
        const nextId = {
            "id": arethusa
                .fmap(ArethusaDoc.nextTokenId)
                .fromMaybe("")
        };
        const createWordElement = XML
            .createElement("word")({ ...nextId, ...attrs });
        const wordElement = sentence
            .docCopy
            .fmap(createWordElement);
        const sentenceById = sentence._id
            .fmap(ArethusaDoc.sentenceById);
        return MaybeT.of(sentence)
            .bind(ArethusaDoc.parentArethusa)
            .fmap(DXML.node)
            .fmap(XML.deepcopy)
            .bind(ArethusaDoc.fromNode)
            .applyBind(sentenceById)
            .fmap(DXML.node)
            .bind(XML.appendElementToNodePretty(wordElement))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    get attrs() {
        return DOM.Elem.attributes(this._element);
    }
    static appendWordToSentenceFromAttrs = (attrs) => (sentence) => {
        const arethusa = ArethusaDoc
            .parentArethusa(sentence);
        const nextId = {
            "id": arethusa
                .fmap(ArethusaDoc.nextTokenId)
                .fromMaybe("")
        };
        // Remove newlines from form
        attrs.form = attrs.form.replace(/[\n\t\s]+/g, "");
        const createWordElement = XML
            .createElement("word")({ ...nextId, ...attrs });
        const wordElement = sentence
            .docCopy
            .fmap(createWordElement);
        const sentenceById = sentence._id
            .fmap(ArethusaDoc.sentenceById);
        return MaybeT.of(sentence)
            .bind(ArethusaDoc.parentArethusa)
            .fmap(DXML.node)
            .fmap(XML.deepcopy)
            .bind(ArethusaDoc.fromNode)
            .applyBind(sentenceById)
            .fmap(DXML.node)
            .bind(XML.appendElementToNodePretty(wordElement))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static appendToken = (token) => (sentence) => {
        const tokenNode = DXML
            .node(token)
            .cloneNode(true);
        return MaybeT.of(DXML.node(sentence))
            .bind(XML.appendChildToNode(tokenNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static appendArtificial = (artificial) => (sentence) => {
        const artificialNode = DXML
            .node(artificial)
            .cloneNode(true);
        return MaybeT.of(DXML.node(sentence))
            .bind(XML.appendChildToNode(artificialNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static tokenById = (tokenId) => (sentence) => {
        return MaybeT.of(MaybeT.of(sentence)
            .fmap(ArethusaSentence.tokens)
            .fromMaybe([])
            .find(ArethusaWord.matchId(tokenId)));
    };
    static arethusaTokenIds = (s) => {
        return ArethusaSentence
            .tokens(s)
            .map(ArethusaToken.id)
            .filter((item) => item.isSomething)
            .map((item) => item.value);
    };
    static tokens = (s) => {
        return MaybeT.of(s)
            .fmap(DXML.node)
            .fmap(XML.childNodes)
            .fmap(ArethusaSentence.arethusaTokensFromNodes)
            .fromMaybe([]);
    };
    static arethusaTokensFromNodes = (nodes) => {
        return nodes
            .filter((node) => node.nodeName === "word")
            .map(ArethusaToken.fromXMLNode);
    };
    static prependArtificial = (artificial) => (sentence) => {
        const artificialNode = DXML
            .node(artificial)
            .cloneNode(true);
        return MaybeT.of(DXML.node(sentence))
            .fmap(XML.prependChildToNode(artificialNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    get lang() {
        return ArethusaSentence.lang(this);
    }
    static lang = (sentence) => {
        const node = DXML.node(sentence);
        return XML.attrVal("xml:lang")(node);
    };
    get notes() {
        return ArethusaSentence.notes(this);
    }
    static notes = (sentence) => {
        const node = DXML.node(sentence);
        return XML.attrVal("notes")(node);
    };
    static prependToken = (token) => (sentence) => {
        const tokenNode = DXML
            .node(token)
            .cloneNode(true);
        return MaybeT.of(DXML.node(sentence))
            .fmap(XML.prependChildToNode(tokenNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static appendWordAttrs = (attrs) => (s) => {
        function _reduce(a, wordAttrs) {
            const getSent = ArethusaSentence
                .id(s)
                .fmap(ArethusaDoc.sentenceById);
            const appendWord = MaybeT.of(wordAttrs)
                .fmap(ArethusaSentence.appendWordToSentenceFromAttrs);
            return a
                .applyBind(getSent)
                .applyBind(appendWord);
        }
        return attrs.reduce(_reduce, s.arethusa);
    };
    /**
     * Only used in conversion from EpiDoc,
     * so no need to deal with Artificial Tokens
     * @param words
     * @returns
     */
    static appendMaybeWords = (words) => (s) => {
        function _reduce(a, item) {
            const getSent = ArethusaSentence
                .id(s)
                .fmap(ArethusaDoc.sentenceById);
            const appendWord = item
                .fmap(ArethusaWord.createAttrs)
                .fmap(ArethusaSentence.appendWordToSentenceFromAttrs);
            return a
                .applyBind(getSent)
                .applyBind(appendWord);
        }
        return words.reduce(_reduce, s.arethusa);
    };
    static appendWords = (words) => (s) => {
        function _reduce(a, item) {
            const getSent = ArethusaSentence
                .id(s)
                .fmap(ArethusaDoc.sentenceById);
            const appendWord = MaybeT.of(item)
                .fmap(ArethusaWord.createAttrs)
                .fmap(ArethusaSentence.appendWordToSentenceFromAttrs);
            return a
                .applyBind(getSent)
                .applyBind(appendWord);
        }
        return words.reduce(_reduce, s.arethusa);
    };
    get arethusa() {
        return this.doc
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    }
    static tokenByTokenAndSentenceId = (tokenId) => (sentenceId) => (a) => {
        return MaybeT.of(ArethusaDoc
            .sentenceById(sentenceId)(a)
            .fmap(ArethusaSentence.tokens)
            .fromMaybe([])
            .find(ArethusaWord.matchId(tokenId)));
    };
    get doc() {
        return MaybeT.of(this._node.ownerDocument);
    }
    get docCopy() {
        return this.doc.fmap(XML.deepcopy);
    }
    static firstToken(sentence) {
        return Arr.head(sentence.tokensProp);
    }
    static firstWord(sentence) {
        return Arr.head(sentence.tokens);
    }
    static incrementId = (s) => {
        const id = ArethusaSentence.id(s);
        const newId = id.fmap(Str.increment);
        const getSentence = id.fmap(ArethusaDoc.sentenceById);
        return s
            .docCopy
            .bind(ArethusaDoc.fromNode)
            .applyBind(getSentence)
            .fmap(DXML.node)
            .applyFmap(newId.fmap(XML.setId))
            .fmap(ArethusaSentence.fromXMLNode);
    };
    static lastToken = (sentence) => {
        return MaybeT.of(sentence)
            .fmap(ArethusaSentence.tokens)
            .bind(Arr.last);
    };
    static lastTokenId = (sentence) => {
        return MaybeT.of(sentence)
            .bind(ArethusaSentence.lastToken)
            .bind(ArethusaToken.id);
    };
    /**
     * Creates an XML string from a plain text string.
     * @param a
     * @returns
     */
    static XMLStrFromPlainTextStr = (a) => (str) => {
        const sentenceElem = a
            .doc
            .fmapErr("No XML document.", XML.createElement("sentence")({ id: ArethusaDoc.newNextSentenceId(a),
            notes: "",
            "xml:lang": "" }));
        const doc = MaybeT
            .of(a)
            .fmap(DXML.node)
            .bind(XML.ownerDocument);
        const createWord = doc
            .fmap(flip(XML.createElement("word")))
            .unpack(null);
        if (createWord === null) {
            console.error("create word function is null.");
            return sentenceElem;
        }
        const wordElems = MaybeT.of(str)
            .fmapErr("Error with string.", Str.split(/[\s\t\n]/g))
            .fromMaybe([])
            .map(Str.strip)
            .map(ArethusaWord.createAttrs)
            .map(createWord);
        sentenceElem.fmap(XML.appendChildrenToNode(wordElems));
        return sentenceElem;
    };
    static fromXMLNode = (node) => {
        return new ArethusaSentence(node);
    };
    static id = (s) => {
        return XML.attr("id")(s._node)
            .bind(XML.nodeValue);
    };
    get _id() {
        return XML.attr("id")(this._node)
            .bind(XML.nodeValue);
    }
    static moveToken = (moveFunc) => (id) => (refNodeId) => (sentence) => {
        const tokenNode = ArethusaSentence
            .tokenById(id)(sentence)
            .fmap(DXML.node);
        const refNode = ArethusaSentence
            .tokenById(refNodeId)(sentence)
            .fmap(DXML.node);
        const wordNodeCopy = tokenNode.fmap(XML.deepcopy);
        const insertNode = wordNodeCopy
            .fmap(moveFunc);
        const newSentenceNode = refNode
            .applyBind(insertNode);
        return newSentenceNode
            .applyFmap(tokenNode.fmap(XML.removeChild))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static moveTokenDown = (tokenId) => (sentence) => {
        const tokenNode = ArethusaSentence
            .tokenById(tokenId)(sentence)
            .fmap(DXML.node);
        const previousSibNodeId = tokenNode
            .bind(XML.nextSibling)
            .bind(XML.attrVal("id"));
        const moveNode = previousSibNodeId
            .fmap(ArethusaSentence.moveToken(XML.insertAfter)(tokenId));
        return MaybeT
            .of(sentence)
            .applyBind(moveNode);
    };
    static moveTokenUp = (tokenId) => (sentence) => {
        const tokenNode = ArethusaSentence.tokenById(tokenId)(sentence)
            .fmap(DXML.node);
        const previousSibNodeId = tokenNode
            .bind(XML.previousSibling)
            .bind(XML.attrVal("id"));
        const moveNode = previousSibNodeId
            .fmap(ArethusaSentence.moveToken(XML.insertBefore)(tokenId));
        return MaybeT
            .of(sentence)
            .applyBind(moveNode);
    };
    static nextTokenIds = (startTokenId) => (s) => {
        return ArethusaSentence
            .tokenById(startTokenId)(s)
            .fmap(DXML.node)
            .bind(XML.nextSiblingElements)
            .fromMaybe([])
            .map(ArethusaWord.fromXMLNode)
            .map(ArethusaWord.id)
            .filter((item) => item.isSomething)
            .map((item) => item.value);
    };
    static removeToken = (token) => (sentence) => {
        // NB Not working
        const tokenNode = DXML.node(token);
        return MaybeT.of(DXML.node(sentence))
            .fmap(XML.removeChild(tokenNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    // static removeTokens = (sentence: ArethusaSentence): ArethusaSentence {
    //     const children = MaybeT.of(DXML.node(sentence))
    //         .fmap(XML.childNodes)
    //         .unpack<Node[]>([])
    // }
    static removeTokenById = (tokenId) => (s) => {
        const removeChild = ArethusaSentence
            .tokenById(tokenId)(s)
            .fmap(DXML.node)
            .fmap(XML.removeChild);
        return MaybeT.of(s)
            .fmap(DXML.node)
            .applyFmap(removeChild)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    /**
     * Sets the document_id attribute of the <sentence> node.
     * Makes the change in place.
     * @param id string
     * @param sentence ArethusaSentence
     * @returns Maybe<ArethusaSentence>
     */
    static setDocId = (id) => (sentence) => {
        return MaybeT.of(sentence)
            .fmap(DXML.node)
            .fmap(XML.setAttr('document_id')(id))
            .fmap(ArethusaSentence.fromXMLNode);
    };
    get tokensProp() {
        return ArethusaSentence.tokens(this);
    }
    static toTreeSentState = (sentence) => {
        const id = sentence._id.value || "";
        if (id == "") {
            console.error("No sentence ID");
        }
        const lang = sentence.lang.value || "";
        const notes = sentence.notes.value || "";
        const getTreeSentState = TreeState.ofTokens(id, lang, notes);
        const tokens = ArethusaSentence.treeTokens(sentence);
        return getTreeSentState(tokens);
    };
    static toTreeSentStateWithNodesFromExistingTree = (nodes) => (sentence) => {
        // Nodes from existing tree supplied
        const id = sentence._id.fromMaybe("");
        if (id == "") {
            console.error("No sentence ID");
        }
        const lang = sentence.lang.fromMaybe("");
        const notes = sentence.notes.fromMaybe("");
        const treeTokens = ArethusaSentence.treeTokens(sentence);
        return TreeState.ofTokensWithExistingNodes(nodes)(id, lang, notes)(treeTokens);
    };
    static treeTokens = (sentence) => {
        return MaybeT.of(sentence)
            .fmap(ArethusaSentence.tokens)
            .fromMaybe([])
            .map(ArethusaToken.toTreeToken);
    };
    static wordByWordAndSentenceId = (wordId) => (sentenceId) => (a) => {
        return MaybeT.of(ArethusaDoc
            .sentenceById(sentenceId)(a)
            .fmap(ArethusaSentence.words)
            .fromMaybe([])
            .find(ArethusaWord.matchId(wordId)));
    };
    static wordById = (wordId) => (sentence) => {
        return MaybeT.of(MaybeT.of(sentence)
            .fmap(ArethusaSentence.words)
            .fromMaybe([])
            .find(ArethusaWord.matchId(wordId)));
    };
    static wordIds = (s) => {
        return ArethusaSentence
            .words(s)
            .map(ArethusaWord.id)
            .filter((item) => item.isSomething)
            .map((item) => item.value);
    };
    static words = (s) => {
        return MaybeT.of(s)
            .fmap(DXML.node)
            .fmap(XML.childNodes)
            .fmap(ArethusaSentence.wordsFromNodes)
            .fromMaybe([]);
    };
    static wordsAsNormalizedStr = (s) => {
        const wordsArr = ArethusaSentence
            .words(s)
            .map(ArethusaWord.form);
        const newWords = Arr.removeNothings(wordsArr);
        return newWords.join(' ')
            .replace(/\s\./g, '.')
            .replace(/\s,/g, ',')
            .replace(/\s·/g, '·')
            .replace(/\s·/g, '·');
    };
    static wordsAsLeidenStr = (s) => {
        // Returns the Leiden text of a sentence
        // Uses the @leiden attribute on an ArethusaToken
        // if this contains any text;
        // otherwise uses the @form attribute
        const wordsArr = ArethusaSentence
            .words(s)
            .map((word) => {
            if (word.leiden.fromMaybe("") === "") {
                return word.form.fromMaybe("");
            }
            return word.leiden.fromMaybe("");
        });
        return wordsArr.join(' ')
            .replace(/\|+/g, "|")
            .replace(/·\s+·/g, '·')
            .replace(/\|\s?/g, "\n")
            .replace(/^\n/, "")
            .replace(/\n{2,}/g, "\n")
            .replace(/⟧( +)?⟦/g, "$1")
            .replace(/(?<!-\?)\]( +)?\[(?!-\?)/g, "$1")
            .replace(/-\?-\]\s+?\[-\?-/g, "-?-")
            .replace(/ +/g, " ");
    };
    static wordsFromNodes = (nodes) => {
        return nodes
            .filter((node) => node.nodeName === "word")
            .filter((node) => XML.hasAttr('lemma')(node) === true)
            .map(ArethusaWord.fromXMLNode);
    };
    get tokens() {
        return ArethusaSentence.words(this);
    }
    static get xpathAddress() {
        return "descendant-or-self::treebank/sentence";
    }
    static of(node) {
        return new ArethusaSentence(node);
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
}
