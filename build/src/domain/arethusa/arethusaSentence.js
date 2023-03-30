class ArethusaSentence {
    constructor(node) {
        this._node = node;
    }
    get arethusa() {
        return this.doc
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    }
    get doc() {
        return MaybeT.of(this._node.ownerDocument);
    }
    get docCopy() {
        return this.doc.fmap(XML.deepcopy);
    }
    static firstWord(sentence) {
        return Arr.head(sentence.wordsProp);
    }
    static lastWord(sentence) {
        return MaybeT.of(sentence)
            .fmap(ArethusaSentence.words)
            .bind(Arr.last);
    }
    get _id() {
        return XML.attr("id")(this._node)
            .bind(XML.nodeValue);
    }
    get wordsProp() {
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
ArethusaSentence.appendWordToSentenceFromAttrs = (attrs) => (sentence) => {
    const arethusa = ArethusaDoc
        .parentArethusa(sentence);
    const nextId = { "id": arethusa.fmap(ArethusaDoc.nextWordId).unpack("") };
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
ArethusaSentence.appendWord = (word) => (sentence) => {
    const wordNode = DXML
        .node(word)
        .cloneNode(true);
    return MaybeT.of(DXML.node(sentence))
        .bind(XML.appendChildToNode(wordNode))
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaSentence.prependWord = (word) => (sentence) => {
    const wordNode = DXML
        .node(word)
        .cloneNode(true);
    return MaybeT.of(DXML.node(sentence))
        .fmap(XML.prependChildToNode(wordNode))
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaSentence.appendMaybeWords = (words) => (s) => {
    function _reduce(a, item) {
        const getSent = ArethusaSentence
            .id(s)
            .fmap(ArethusaDoc.sentenceById);
        const appendWord = item
            .fmap(ArethusaWord.createFormDict)
            .fmap(ArethusaSentence.appendWordToSentenceFromAttrs);
        return a
            .applyBind(getSent)
            .applyBind(appendWord);
    }
    return words.reduce(_reduce, s.arethusa);
};
ArethusaSentence.appendWords = (words) => (s) => {
    function _reduce(a, item) {
        const getSent = ArethusaSentence
            .id(s)
            .fmap(ArethusaDoc.sentenceById);
        const appendWord = MaybeT.of(item)
            .fmap(ArethusaWord.createFormDict)
            .fmap(ArethusaSentence.appendWordToSentenceFromAttrs);
        return a
            .applyBind(getSent)
            .applyBind(appendWord);
    }
    return words.reduce(_reduce, s.arethusa);
};
ArethusaSentence.incrementId = (s) => {
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
ArethusaSentence.lastWordId = (sentence) => {
    return MaybeT.of(sentence)
        .fmap(ArethusaSentence.words)
        .bind(Arr.last)
        .bind(ArethusaWord.id);
};
ArethusaSentence.XMLStrFromPlainTextStr = (a) => (str) => {
    const sentenceElem = a
        .doc
        .fmapErr("No XML document.", XML.createElement("sentence")({ id: ArethusaDoc.newNextSentenceId(a) }));
    const doc = MaybeT
        .of(a)
        .fmap(DXML.node)
        .bind(XML.ownerDocument);
    const createWord = doc.fmap(flip(XML.createElement("word"))).unpack(null);
    if (createWord === null) {
        console.error("create word function is null.");
        return sentenceElem;
    }
    const wordElems = MaybeT.of(str)
        .fmapErr("Error with string.", Str.split(/[\s\t\n]/g))
        .unpackT([])
        .map(Str.strip)
        .map(ArethusaWord.createFormDict)
        .map(createWord);
    sentenceElem.fmap(XML.appendChildrenToNode(wordElems));
    return sentenceElem;
};
ArethusaSentence.fromXMLNode = (node) => {
    return new ArethusaSentence(node);
};
ArethusaSentence.id = (s) => {
    return XML.attr("id")(s._node)
        .bind(XML.nodeValue);
};
ArethusaSentence.moveWord = (moveFunc) => (id) => (refNodeId) => (sentence) => {
    const wordNode = ArethusaSentence.wordById(id)(sentence)
        .fmap(DXML.node);
    const refNode = ArethusaSentence.wordById(refNodeId)(sentence)
        .fmap(DXML.node);
    const wordNodeCopy = wordNode.fmap(XML.deepcopy);
    const insertNode = wordNodeCopy
        .fmap(moveFunc);
    const newSentenceNode = refNode
        .applyBind(insertNode);
    return newSentenceNode
        .applyFmap(wordNode.fmap(XML.removeChild))
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaSentence.moveWordDown = (wordId) => (sentence) => {
    const wordNode = ArethusaSentence.wordById(wordId)(sentence)
        .fmap(DXML.node);
    const previousSibNodeId = wordNode
        .bind(XML.nextSibling)
        .bind(XML.attrVal("id"));
    const moveNode = previousSibNodeId.fmap(ArethusaSentence.moveWord(XML.insertAfter)(wordId));
    return MaybeT.of(sentence).applyBind(moveNode);
};
ArethusaSentence.moveWordUp = (wordId) => (sentence) => {
    const wordNode = ArethusaSentence.wordById(wordId)(sentence)
        .fmap(DXML.node);
    const previousSibNodeId = wordNode
        .bind(XML.previousSibling)
        .bind(XML.attrVal("id"));
    const moveNode = previousSibNodeId.fmap(ArethusaSentence.moveWord(XML.insertBefore)(wordId));
    return MaybeT.of(sentence).applyBind(moveNode);
};
ArethusaSentence.nextWordIds = (startWordId) => (s) => {
    return ArethusaSentence
        .wordById(startWordId)(s)
        .fmap(DXML.node)
        .bind(XML.nextSiblingElements)
        .unpackT([])
        .map(ArethusaWord.fromXMLNode)
        .map(ArethusaWord.id)
        .filter((item) => item.isSomething)
        .map((item) => item.value);
};
ArethusaSentence.removeWord = (word) => (sentence) => {
    // Not working
    const wordNode = DXML.node(word);
    return MaybeT.of(DXML.node(sentence))
        .fmap(XML.removeChild(wordNode))
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaSentence.removeWordById = (wordId) => (s) => {
    const removeChild = ArethusaSentence
        .wordById(wordId)(s)
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
ArethusaSentence.setDocId = (id) => (sentence) => {
    return MaybeT.of(sentence)
        .fmap(DXML.node)
        .fmap(XML.setAttr('document_id')(id))
        .fmap(ArethusaSentence.fromXMLNode);
};
ArethusaSentence.toTreeSentState = (sentence) => {
    const getTreeSentState = sentence._id
        .fmap(TreeState.ofTokens);
    return MaybeT.of(ArethusaSentence
        .treeTokens(sentence))
        .applyFmap(getTreeSentState);
};
ArethusaSentence.toTreeSentStateWithNodesFromExistingTree = (nodes) => (sentence) => {
    // Nodes from existing tree supplied
    const getTreeSentState = sentence._id
        .fmap(TreeState.ofTokensWithExistingNodes(nodes));
    return MaybeT.of(ArethusaSentence
        .treeTokens(sentence))
        .applyFmap(getTreeSentState);
};
ArethusaSentence.treeTokens = (sentence) => {
    return MaybeT.of(sentence)
        .fmap(ArethusaSentence.words)
        .unpackT([])
        .map(ArethusaWord.toTreeToken);
};
ArethusaSentence.wordByWordAndSentenceId = (wordId) => (sentenceId) => (a) => {
    return MaybeT.of(ArethusaDoc
        .sentenceById(sentenceId)(a)
        .fmap(ArethusaSentence.words)
        .unpackT([])
        .find(ArethusaWord.matchId(wordId)));
};
ArethusaSentence.wordById = (wordId) => (sentence) => {
    return $$(MaybeT.of)(MaybeT.of(sentence)
        .fmap(ArethusaSentence.words)
        .unpackT([])
        .find(ArethusaWord.matchId(wordId)));
};
ArethusaSentence.wordIds = (s) => {
    return ArethusaSentence
        .words(s)
        .map(ArethusaWord.id)
        .filter((item) => item.isSomething)
        .map((item) => item.value);
};
ArethusaSentence.words = (s) => {
    return MaybeT.of(s)
        .fmap(DXML.node)
        .fmap(XML.childNodes)
        .fmap(ArethusaSentence.wordsFromNodes)
        .unpackT([]);
};
ArethusaSentence.wordsFromNodes = (nodes) => {
    return nodes
        .filter((node) => node.nodeName === "word")
        .map(ArethusaWord.fromXMLNode);
};
