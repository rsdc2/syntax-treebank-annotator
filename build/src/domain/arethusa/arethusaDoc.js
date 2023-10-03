class ArethusaDoc {
    constructor(node) {
        this._node = node;
        this._element = this._element = DOM.Node_.element(node).fromMaybeThrow();
    }
    static appendEmptyWord(a) {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(ArethusaWord.createAttrs("---")));
    }
    get attrs() {
        return this._element.attributes;
    }
    get doc() {
        if (XML.isDocument(this.node)) {
            return MaybeT.of(this.node);
        }
        return MaybeT.of(this._node.ownerDocument);
    }
    get docCopy() {
        return this.doc.fmap(XML.deepcopy);
    }
    static firstSentence(a) {
        return Arr.head(a.sentences);
    }
    static lastSentence(a) {
        return Arr.last(a.sentences);
    }
    static newNextSentenceId(a) {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.id)
            .fmap(Str.increment)
            .unpack("1");
    }
    static nextWordId(arethusa) {
        const nextId = ArethusaDoc
            .lastWord(arethusa)
            .bind(ArethusaWord.id)
            .fmap(Str.increment);
        return nextId.unpack("1");
    }
    get node() {
        return this._node;
    }
    static parentArethusa(sentence) {
        return MaybeT.of(sentence)
            .fmap(DXML.node)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    }
    get sentences() {
        return ArethusaDoc.sentences(this);
    }
    get text() {
        return MaybeT.of(this.node.textContent);
    }
    static toXMLStr(a) {
        return XML.toStr(a.node);
    }
    get tokens() {
        return ArethusaDoc.words(this);
    }
}
ArethusaDoc.appendArtificial = (attrs) => (a) => {
    return ArethusaDoc
        .lastSentence(a)
        .bind(ArethusaSentence.appendArtificialToSentenceFromAttrs(attrs));
};
ArethusaDoc.appendArtificialToSentence = (attrs) => (sentenceId) => (a) => {
    return ArethusaDoc
        .sentenceById(sentenceId)(a)
        .bind(ArethusaSentence.appendArtificialToSentenceFromAttrs(attrs));
};
ArethusaDoc.appendSentence = (a) => {
    return ArethusaDoc
        .appendSentenceWithId(ArethusaDoc.newNextSentenceId(a))(a);
};
ArethusaDoc.appendSentences = (sentences) => (a) => {
    let doc = ArethusaDoc.deepcopy(a);
    sentences.forEach((s) => {
        const sentenceXML = DXML.node(s);
        doc = doc
            .fmap(DXML.node)
            .bind(XML.xpath("//treebank"))
            .bind(Arr.head)
            .bind(XML.appendChildToNode(sentenceXML))
            .bind(ArethusaDoc.fromNode);
    });
    return doc;
};
ArethusaDoc.appendSentenceWithId = (sentenceId) => (a) => {
    const id = { "id": sentenceId };
    const sentenceElement = a
        .docCopy
        .fmap(XML.createElement("sentence")(id));
    const appendSentence = sentenceElement
        .fmap(XML.appendChildToNode);
    return a
        .docCopy
        .bind(XML.firstDocChild)
        .applyBind(appendSentence)
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaDoc.appendSentenceFromPlainTextStr = (s) => (a) => {
    const sentence = ArethusaDoc
        .appendSentence(a)
        .bind(ArethusaDoc.lastSentence);
    const words = MaybeT.of(s)
        .fmapErr("Error with string.", Str.split(" "))
        .fromMaybe([])
        .map(Str.strip);
    return sentence.bind(ArethusaSentence.appendWords(words));
};
ArethusaDoc.appendWord = (attrs) => (a) => {
    return ArethusaDoc
        .lastSentence(a)
        .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs));
};
ArethusaDoc.appendWordToSentence = (attrs) => (sentenceId) => (a) => {
    return ArethusaDoc
        .sentenceById(sentenceId)(a)
        .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs));
};
ArethusaDoc.deepcopy = (a) => {
    return a
        .docCopy
        .bind(ArethusaDoc.fromNode);
};
/**
 *
 * @param a Arethusa
 * @returns the value of the id attribute of the \<document_meta\> node.
 */
ArethusaDoc.docId = (a) => {
    return MaybeT.of(a)
        .fmap(DXML.node)
        .bind(XML.xpath(".//document_meta"))
        .bind(Arr.head)
        .bind(XML.attrVal('id'));
};
/**
 *
 * @param a Arethusa
 * @returns \<document_meta\> node from the Arethusa document.
 */
ArethusaDoc.documentMeta = (a) => {
    return MaybeT.of(a)
        .fmap(DXML.node)
        .bind(XML.xpath(".//document_meta"))
        .bind(Arr.head);
};
ArethusaDoc.ensureSentence = (sentenceId) => (a) => {
    if (ArethusaDoc.hasSentence(sentenceId)(a)) {
        return MaybeT.of(a);
    }
    return ArethusaDoc.appendSentence(a);
};
ArethusaDoc.fromNode = (node) => {
    return MaybeT.of(new ArethusaDoc(node));
};
ArethusaDoc.fromSentences = (sentences) => {
    const sentenceNodes = sentences
        .map(DXML.node);
    return MaybeT.of(XML
        .fromXMLStr(arethusaTemplate))
        .bind(XML.firstChild)
        .bind(XML.appendChildrenToNode(sentenceNodes))
        .bind(ArethusaDoc.fromNode);
};
ArethusaDoc.fromPlainTextStr = (plainText) => {
    const arethusaXMLNode = MaybeT
        .of(XML.fromXMLStr(arethusaTemplate))
        .bind(XML.documentElement);
    const arethusa = arethusaXMLNode
        .bind(ArethusaDoc.fromNode);
    const getSentenceElem = arethusa
        .fmap(ArethusaSentence.XMLStrFromPlainTextStr)
        .unpack(null);
    if (getSentenceElem === null) {
        console.error("Could not create getSentenceElem function.");
        return arethusa;
    }
    const sentenceStrs = MaybeT.of(plainText)
        .fmapErr("Error in plainText input.", Str.split(/[\.\?\;\:]/g))
        .fromMaybe([])
        .map(Str.replace(/\,/g)(""))
        .map(Str.strip);
    const sentenceElems = Arr
        .removeEmptyStrs(sentenceStrs)
        .map(getSentenceElem);
    const sentenceElemsNoNothings = Arr.removeNothings(sentenceElems);
    const arethusaXMLNodeWithChildren = arethusaXMLNode
        .bind(XML.appendChildrenToNode(sentenceElemsNoNothings));
    return arethusaXMLNodeWithChildren
        .bind(ArethusaDoc.fromNode)
        .bind(ArethusaDoc.reorderSentenceIds)
        .bind(ArethusaDoc.renumberTokenIds(false));
};
ArethusaDoc.fromXMLStr = (arethusaXML) => {
    return MaybeT.of(arethusaXML)
        .fmap(XML.fromXMLStr)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaDoc.incrementSentenceIdsFrom = (startSentenceId) => (a) => {
    const reduceIncrement = (a, id) => {
        const s = a.bind(ArethusaDoc.sentenceById(id));
        return s
            .bind(ArethusaSentence.incrementId)
            .bind(ArethusaDoc.parentArethusa);
    };
    return ArethusaDoc
        .nextSentenceIds(startSentenceId)(a)
        .reduce(reduceIncrement, MaybeT.of(a));
};
ArethusaDoc.insertSentence = (insertFunc) => (refSentenceId) => (a) => {
    const id = { "id": Str.increment(refSentenceId) };
    const sentenceElement = a
        .docCopy
        .fmap(XML.createElement("sentence")(id));
    const insertSentence = sentenceElement
        .fmap(insertFunc);
    const newArethusa = MaybeT.of(a)
        .bind(ArethusaDoc.deepcopy)
        .bind(ArethusaDoc.sentenceById(refSentenceId))
        .fmap(DXML.node)
        .applyBind(insertSentence)
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
    return newArethusa.bind(ArethusaDoc.reorderSentenceIds);
};
ArethusaDoc.insertSentenceAfter = (refSentenceId) => (a) => {
    return ArethusaDoc.insertSentence(XML.insertAfter)(refSentenceId)(a);
};
ArethusaDoc.insertSentenceBefore = (refSentenceId) => (a) => {
    return ArethusaDoc.insertSentence(XML.insertBefore)(refSentenceId)(a);
};
ArethusaDoc.lastToken = (a) => {
    return MaybeT.of(a)
        .fmap(ArethusaDoc.tokens)
        .bind(Arr.last);
};
ArethusaDoc.lastWord = (a) => {
    return MaybeT.of(a)
        .fmap(ArethusaDoc.words)
        .bind(Arr.last);
};
ArethusaDoc.hasSentence = (sentenceId) => (a) => {
    const sentence = ArethusaDoc.sentenceById(sentenceId)(a);
    return sentence.value !== Nothing.of().value;
};
ArethusaDoc.nextTokenId = (arethusa) => {
    const nextId = ArethusaDoc
        .lastToken(arethusa)
        .bind(ArethusaToken.id)
        .fmap(Str.increment);
    return nextId.unpack("1");
};
ArethusaDoc.pushToFrontend = (textStateIO) => {
    const outputArethusaXML = textStateIO
        .outputArethusaXML
        .unpack("");
    const inputArethusaXML = textStateIO
        .inputArethusaXML
        .unpack("");
    if (inputArethusaXML.includes("parsererror")) {
        Frontend
            .arethusaInputTextArea
            .fmap(Frontend.updateTextArea(""));
        Frontend.showMessage("Input Arethusa is not valid XML.");
    }
    else {
        Frontend.hideMessage();
        Frontend
            .arethusaInputTextArea
            .fmap(Frontend.updateTextArea(inputArethusaXML));
    }
    if (outputArethusaXML.includes("parsererror")) {
        Frontend
            .arethusaOutputDiv
            .fmap(Frontend.updateArethusaDiv("")(Nothing.of()));
    }
    else {
        const highlighted = textStateIO
            .highlightedNodeStr;
        Frontend
            .arethusaOutputDiv
            .fmap(Frontend.updateArethusaDiv(outputArethusaXML)(highlighted));
    }
};
ArethusaDoc.pushTokenToSentence = (addFunc) => (tokenId) => (newSentenceId) => (a) => {
    const currentToken = ArethusaDoc
        .tokenById(tokenId)(a);
    const getThisSentence = currentToken
        .bind(ArethusaWord.parentSentenceId)
        .fmap(ArethusaDoc.sentenceById);
    const addToken = currentToken.fmap(addFunc);
    const newSentence = MaybeT.of(a)
        .bind(ArethusaDoc.ensureSentence(newSentenceId))
        .bind(ArethusaDoc.sentenceById(newSentenceId));
    const newArethusa = newSentence
        .applyBind(addToken);
    const thisSentence = newArethusa
        .bind(ArethusaDoc.deepcopy)
        .applyBind(getThisSentence);
    const newArethusa2 = thisSentence
        .bind(ArethusaSentence.removeTokenById(tokenId));
    return newArethusa2;
};
ArethusaDoc.moveTokenToNextSentence = (tokenId) => (a) => {
    const thisSentenceId = MaybeT.of(a)
        .bind(ArethusaDoc.tokenById(tokenId))
        .bind(ArethusaWord.parentSentenceId);
    const nextSentenceId = thisSentenceId
        .fmap(Str.increment);
    const prependWordToNextSentence = nextSentenceId
        .fmap(ArethusaDoc.pushTokenToSentence(ArethusaSentence.prependToken)(tokenId));
    return MaybeT.of(a)
        .applyBind(prependWordToNextSentence);
};
ArethusaDoc.moveTokenToPrevSentence = (wordId) => (a) => {
    const thisSentenceId = MaybeT.of(a)
        .bind(ArethusaDoc.wordById(wordId))
        .bind(ArethusaWord.parentSentenceId);
    const prevSentenceId = thisSentenceId
        .fmap(Str.decrement);
    const appendWordToPrevSentence = prevSentenceId
        .fmap(ArethusaDoc.pushTokenToSentence(ArethusaSentence.appendToken)(wordId));
    return MaybeT.of(a)
        .applyBind(appendWordToPrevSentence);
};
ArethusaDoc.nextSentenceIds = (startSentenceId) => (a) => {
    return ArethusaDoc
        .sentenceById(startSentenceId)(a)
        .fmap(DXML.node)
        .bind(XML.nextSiblingElements)
        .fromMaybe([])
        .map(ArethusaSentence.fromXMLNode)
        .map(ArethusaSentence.id)
        .filter((item) => item.isSomething)
        .map((item) => item.value);
};
ArethusaDoc._removeTokenOrSentence = (id) => (a) => (entity) => {
    const entityNode = MaybeT.of(entity)
        .fmap(DXML.node);
    const removeSentenceNode = entityNode
        .fmap(XML.removeChild);
    const entityParentNode = entityNode.bind(XML.parent);
    const newParent = entityParentNode
        .applyFmap(removeSentenceNode);
    return newParent
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaDoc.removeSentenceById = (id) => (a) => {
    return ArethusaDoc
        .sentenceById(id)(a)
        .bind(ArethusaDoc._removeTokenOrSentence(id)(a));
};
ArethusaDoc.removeSentences = (a) => {
    // Returns a deep copy of the input Arethusa Doc with the sentences removed
    let doc = ArethusaDoc.deepcopy(a);
    const ids = doc
        .fmap(ArethusaDoc.sentences)
        .fromMaybe([])
        .map(ArethusaSentence.id);
    const newIds = Arr.removeNothings(ids);
    newIds.forEach((id) => {
        doc = doc.bind(ArethusaDoc.removeSentenceById(id));
    });
    return doc;
};
ArethusaDoc.removeTokenByTokenAndSentenceId = (wordId) => (sentenceId) => (a) => {
    return ArethusaSentence
        .tokenByTokenAndSentenceId(wordId)(sentenceId)(a)
        .bind(ArethusaDoc._removeTokenOrSentence(wordId)(a));
};
ArethusaDoc.reorderSentenceIds = (a) => {
    const maybeSentences = MaybeT.of(a)
        .bind(ArethusaDoc.deepcopy)
        .fmap(ArethusaDoc.sentences)
        .fromMaybe([])
        .map((s, idx) => MaybeT.of(DXML.node(s))
        .fmap(XML.setId(Str.fromNum(idx + 1)))
        .fmap(ArethusaSentence.fromXMLNode));
    const sentences = Arr.removeNothings(maybeSentences);
    return ArethusaDoc
        .deepcopy(a)
        .bindErr("No Arethusa", ArethusaDoc.removeSentences)
        .bindErr("No Arethusa with no sentences.", ArethusaDoc.appendSentences(sentences));
};
/**
 * Renumbers token ids in the treebank from 1 to the final token;
 * also renumbers head ids if 'renumberHeads' is set to true
 * @param a
 * @returns
 */
ArethusaDoc.renumberTokenIds = (renumberHeads) => (a) => {
    const maybeWords = MaybeT.of(a)
        .bindErr("No Arethusa.", ArethusaDoc.deepcopy)
        .fmapErr("No words in Arethusa.", ArethusaDoc.tokens)
        .unpack([])
        .map((w, idx) => MaybeT.ofThrow("Could not create Maybe<Word>.", DXML.node(w))
        .fmapErr("Could not make word node.", XML.setId(Str.fromNum(idx + 1)))
        .fmapErr("Could not set ID.", ArethusaToken.fromXMLNode));
    const words = Arr.removeNothings(maybeWords);
    return Arr.head(words)
        .fmapErr("No first node.", DXML.node)
        .bindErr("No node.", XML.ownerDocument)
        .bindErr("No owner document", XML.documentElement)
        .bindErr("No document element.", ArethusaDoc.fromNode);
};
ArethusaDoc.replaceSentence = (a) => (newSentence) => {
    // Get the XML node of the new sentence (i.e. replacement sentence)
    const newSentenceXML = DXML.node(newSentence);
    // Get the XML nodes of the sentences
    const sentenceNodes = ArethusaDoc
        .deepcopy(a)
        .fmap(ArethusaDoc.sentences)
        .fromMaybe([])
        .map(DXML.node);
    // Replace the sentence
    const newSentences = ArethusaSentence
        .id(newSentence)
        .fmap(flip(ArethusaDoc.sentenceNodeIdxById)(a))
        .fmap(Arr.replaceByIdx(sentenceNodes)(newSentenceXML))
        .fromMaybe([])
        .map(ArethusaSentence.fromXMLNode);
    const newdoc = ArethusaDoc.removeSentences(a);
    return newdoc.bind(ArethusaDoc.appendSentences(newSentences));
};
ArethusaDoc.sentences = (a) => {
    const getSentences = XML.xpath(ArethusaSentence.xpathAddress);
    return MaybeT.of(a)
        .fmap(DXML.node)
        .bind(getSentences)
        .fromMaybe([])
        .map(ArethusaSentence.fromXMLNode);
};
ArethusaDoc.sentenceById = (id) => (a) => {
    const sentence = ArethusaDoc
        .sentenceNodeById(id)(a)
        .fmap(ArethusaSentence.fromXMLNode);
    return sentence;
};
ArethusaDoc.sentenceNodeById = (id) => (a) => {
    const sentence = XML
        .xpathMaybe(ArethusaSentence.xpathAddress + `[@id='${id}']`)(a.doc)
        .bind(Arr.head);
    return sentence;
};
ArethusaDoc.sentenceNodeIdxById = (id) => (a) => {
    return MaybeT.of(a)
        .fmap(ArethusaDoc.sentences)
        .fromMaybe([])
        .map(DXML.node)
        .findIndex((node) => {
        return XML.attrVal("id")(node).eq(id);
    });
};
ArethusaDoc.sentenceByTokenId = (id) => (a) => {
    const sentence = XML
        .xpathMaybe(ArethusaWord.parentSentenceAddress(id))(a.doc)
        .bind(Arr.head)
        .fmap(ArethusaSentence.fromXMLNode);
    return sentence;
};
ArethusaDoc.sentenceIdByTokenId = (id) => (a) => {
    return ArethusaDoc.sentenceByTokenId(id)(a)
        .bind(ArethusaSentence.id);
};
/**
 * Sets the id attribute of the <document_meta> node.
 * Makes the change in place.
 * @param id string
 * @param a Arethusa
 * @returns Maybe\<Arethusa\>
 */
ArethusaDoc.setDocId = (id) => (a) => {
    return MaybeT.of(a)
        .bind(ArethusaDoc.documentMeta)
        .fmap(XML.setAttr('id')(id))
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(ArethusaDoc.fromNode);
};
ArethusaDoc.splitSentenceAt = (startTokenId) => (a) => {
    const moveReduce = (_a, wordId) => {
        const newArethusa = _a.bind(ArethusaDoc.deepcopy);
        return newArethusa
            .bind(ArethusaDoc.moveTokenToNextSentence(wordId));
    };
    const nextTokenIds = ArethusaDoc
        .sentenceByTokenId(startTokenId)(a)
        .fmap(ArethusaSentence.nextTokenIds(startTokenId))
        .fromMaybe([]);
    const insertSentence = MaybeT.of(a)
        .bind(ArethusaDoc.sentenceIdByTokenId(startTokenId))
        .fmap(ArethusaDoc.insertSentenceAfter);
    const arethusaWithNewSentenceAndIds = MaybeT.of(a)
        .applyBind(insertSentence);
    return Arr
        .reverse([startTokenId].concat(nextTokenIds))
        .reduce(moveReduce, arethusaWithNewSentenceAndIds);
};
ArethusaDoc.tokenById = (id) => (a) => {
    return XML.xpathMaybe(ArethusaToken.xpathAddress + `[@id='${id}']`)(a.doc)
        .bind(Arr.head)
        .fmap(ArethusaToken.fromXMLNode);
};
ArethusaDoc.tokens = (a) => {
    return ArethusaDoc
        .sentences(a)
        .map(DXML.node)
        .flatMap(XML.childNodes)
        .filter((node) => node.nodeName === "word")
        .map(ArethusaWord.fromXMLNode);
};
ArethusaDoc.words = (a) => {
    return ArethusaDoc
        .sentences(a)
        .map(DXML.node)
        .flatMap(XML.childNodes)
        .filter((node) => node.nodeName === "word")
        .filter((node) => XML.hasAttr('lemma')(node) === true)
        .map(ArethusaWord.fromXMLNode);
};
ArethusaDoc.wordById = (id) => (a) => {
    return XML.xpathMaybe(ArethusaWord.xpathAddress + `[@id='${id}']`)(a.doc)
        .bind(Arr.head)
        .fmap(ArethusaWord.fromXMLNode);
};
