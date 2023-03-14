class Arethusa {
    constructor(node) {
        this._node = node;
    }
    static appendEmptyWord(a) {
        return Arethusa
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs({}));
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
        return head(a.sentences);
    }
    static lastSentence(a) {
        return last(a.sentences);
    }
    static newNextSentenceId(a) {
        return Arethusa
            .lastSentence(a)
            .bind(ArethusaSentence.id)
            .fmap(Str.increment)
            .unpack("1");
    }
    static nextWordId(arethusa) {
        const nextId = Arethusa
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
            .bind(Arethusa.fromNode);
    }
    get sentences() {
        return Arethusa.sentences(this);
    }
    get text() {
        return MaybeT.of(this.node.textContent);
    }
    static toXMLStr(a) {
        return XML.toStr(a.node);
    }
    get wordsProp() {
        return Arethusa.words(this);
    }
}
Arethusa.appendSentence = (a) => {
    return Arethusa
        .appendSentenceWithId(Arethusa.newNextSentenceId(a))(a);
};
Arethusa.appendSentenceWithId = (sentenceId) => (a) => {
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
        .bind(Arethusa.fromNode);
};
Arethusa.appendSentenceFromPlainTextStr = (s) => (a) => {
    const sentence = Arethusa
        .appendSentence(a)
        .bind(Arethusa.lastSentence);
    const words = MaybeT.of(s)
        .fmapErr("Error with string.", Str.split(" "))
        .unpackT([])
        .map(Str.strip);
    return sentence.bind(ArethusaSentence.appendWords(words));
};
Arethusa.appendWord = (attrs) => (a) => {
    return Arethusa
        .lastSentence(a)
        .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs));
};
Arethusa.appendWordToSentence = (attrs) => (sentenceId) => (a) => {
    return Arethusa
        .sentenceById(sentenceId)(a)
        .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs));
};
Arethusa.deepcopy = (a) => {
    return a
        .docCopy
        .bind(Arethusa.fromNode);
};
Arethusa.ensureSentence = (sentenceId) => (a) => {
    if (Arethusa.hasSentence(sentenceId)(a)) {
        return MaybeT.of(a);
    }
    return Arethusa.appendSentence(a);
};
Arethusa.fromNode = (node) => {
    return MaybeT.of(new Arethusa(node));
};
Arethusa.fromSentences = (sentences) => {
    const sentenceNodes = sentences
        .map(DXML.node);
    return MaybeT.of(XML
        .fromXMLStr(arethusaTemplate))
        .bind(XML.firstChild)
        .bind(XML.appendChildrenToNode(sentenceNodes))
        .bind(Arethusa.fromNode);
};
Arethusa.fromPlainTextStr = (plainText) => {
    const arethusaXMLNode = MaybeT
        .of(XML.fromXMLStr(arethusaTemplate))
        .bind(XML.documentElement);
    const arethusa = arethusaXMLNode
        .bind(Arethusa.fromNode);
    const getSentenceElem = arethusa
        .fmap(ArethusaSentence.XMLStrFromPlainTextStr)
        .unpack(null);
    if (getSentenceElem === null) {
        console.error("Could not create getSentenceElem function.");
        return arethusa;
    }
    const sentenceStrs = MaybeT.of(plainText)
        .fmapErr("Error in plainText input.", Str.split(/[\.\?\;\:]/g))
        .unpackT([])
        .map(Str.replace(/\,/g)(""))
        .map(Str.strip);
    const sentenceElems = Arr
        .removeEmptyStrs(sentenceStrs)
        .map(getSentenceElem);
    const sentenceElemsNoNothings = Arr.removeNothings(sentenceElems);
    const arethusaXMLNodeWithChildren = arethusaXMLNode
        .bind(XML.appendChildrenToNode(sentenceElemsNoNothings));
    return arethusaXMLNodeWithChildren
        .bind(Arethusa.fromNode)
        .bind(Arethusa.reorderSentenceIds)
        .bind(Arethusa.reorderWordIds);
};
Arethusa.fromXMLStr = (arethusaXML) => {
    return MaybeT.of(arethusaXML)
        .fmap(XML.fromXMLStr)
        .bind(XML.documentElement)
        .bind(Arethusa.fromNode);
};
Arethusa.incrementSentenceIdsFrom = (startSentenceId) => (a) => {
    const reduceIncrement = (a, id) => {
        const s = a.bind(Arethusa.sentenceById(id));
        return s
            .bind(ArethusaSentence.incrementId)
            .bind(Arethusa.parentArethusa);
    };
    return Arethusa
        .nextSentenceIds(startSentenceId)(a)
        .reduce(reduceIncrement, MaybeT.of(a));
};
Arethusa.insertSentence = (insertFunc) => (refSentenceId) => (a) => {
    const id = { "id": Str.increment(refSentenceId) };
    const sentenceElement = a
        .docCopy
        .fmap(XML.createElement("sentence")(id));
    const insertSentence = sentenceElement
        .fmap(insertFunc);
    const newArethusa = MaybeT.of(a)
        .bind(Arethusa.deepcopy)
        .bind(Arethusa.sentenceById(refSentenceId))
        .fmap(DXML.node)
        .applyBind(insertSentence)
        .bind(XML.ownerDocument)
        .bind(XML.documentElement)
        .bind(Arethusa.fromNode);
    return newArethusa.bind(Arethusa.reorderSentenceIds);
};
Arethusa.insertSentenceAfter = (refSentenceId) => (a) => {
    return Arethusa.insertSentence(XML.insertAfter)(refSentenceId)(a);
};
Arethusa.insertSentenceBefore = (refSentenceId) => (a) => {
    return Arethusa.insertSentence(XML.insertBefore)(refSentenceId)(a);
};
Arethusa.lastWord = (a) => {
    return MaybeT.of(a)
        .fmap(Arethusa.words)
        .bind(last);
};
Arethusa.hasSentence = (sentenceId) => (a) => {
    const sentence = Arethusa.sentenceById(sentenceId)(a);
    return sentence.value !== Nothing.of().value;
};
Arethusa.pushToFrontend = (textStateIO) => {
    const outputArethusaXML = textStateIO
        .outputArethusaXML
        .unpack("");
    const inputArethusaXML = textStateIO
        .inputArethusaXML
        .unpack("");
    if (inputArethusaXML.includes("parsererror")) {
        Frontend
            .arethusaInputTextArea
            .fmap(Frontend.updateTextArea("[Not XML]"));
    }
    else {
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
Arethusa.pushWordToSentence = (addFunc) => (wordId) => (newSentenceId) => (a) => {
    const currentWord = Arethusa
        .wordById(wordId)(a);
    const getThisSentence = currentWord
        .bind(ArethusaWord.parentSentenceId)
        .fmap(Arethusa.sentenceById);
    const addWord = currentWord.fmap(addFunc);
    const newSentence = MaybeT.of(a)
        .bind(Arethusa.ensureSentence(newSentenceId))
        .bind(Arethusa.sentenceById(newSentenceId));
    const newArethusa = newSentence
        .applyBind(addWord);
    const thisSentence = newArethusa
        .bind(Arethusa.deepcopy)
        .applyBind(getThisSentence);
    const newArethusa2 = thisSentence
        .bind(ArethusaSentence.removeWordById(wordId));
    return newArethusa2;
};
Arethusa.moveWordToNextSentence = (wordId) => (a) => {
    const thisSentenceId = MaybeT.of(a)
        .bind(Arethusa.wordById(wordId))
        .bind(ArethusaWord.parentSentenceId);
    const nextSentenceId = thisSentenceId
        .fmap(Str.increment);
    const prependWordToNextSentence = nextSentenceId
        .fmap(Arethusa.pushWordToSentence(ArethusaSentence.prependWord)(wordId));
    return MaybeT.of(a).applyBind(prependWordToNextSentence);
};
Arethusa.moveWordToPrevSentence = (wordId) => (a) => {
    const thisSentenceId = MaybeT.of(a)
        .bind(Arethusa.wordById(wordId))
        .bind(ArethusaWord.parentSentenceId);
    const prevSentenceId = thisSentenceId
        .fmap(Str.decrement);
    const appendWordToPrevSentence = prevSentenceId
        .fmap(Arethusa.pushWordToSentence(ArethusaSentence.appendWord)(wordId));
    return MaybeT.of(a)
        .applyBind(appendWordToPrevSentence);
};
Arethusa.nextSentenceIds = (startSentenceId) => (a) => {
    return Arethusa
        .sentenceById(startSentenceId)(a)
        .fmap(DXML.node)
        .bind(XML.nextSiblingElements)
        .unpackT([])
        .map(ArethusaSentence.fromXMLNode)
        .map(ArethusaSentence.id)
        .filter((item) => item.isSomething)
        .map((item) => item.value);
};
Arethusa._removeWordOrSentence = (id) => (a) => (entity) => {
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
        .bind(Arethusa.fromNode);
};
Arethusa.removeSentenceById = (id) => (a) => {
    return Arethusa
        .sentenceById(id)(a)
        .bind(Arethusa._removeWordOrSentence(id)(a));
};
Arethusa.removeWordByWordAndSentenceId = (wordId) => (sentenceId) => (a) => {
    return ArethusaSentence
        .wordByWordAndSentenceId(wordId)(sentenceId)(a)
        .bind(Arethusa._removeWordOrSentence(wordId)(a));
};
Arethusa.reorderSentenceIds = (a) => {
    const maybeSentences = MaybeT.of(a)
        .bind(Arethusa.deepcopy)
        .fmap(Arethusa.sentences)
        .unpackT([])
        .map((s, idx) => MaybeT.of(DXML.node(s))
        .fmap(XML.setId(Str.fromNum(idx + 1)))
        .fmap(ArethusaSentence.fromXMLNode));
    const sentences = Arr.removeNothings(maybeSentences);
    return Arethusa.fromSentences(sentences);
};
Arethusa.reorderWordIds = (a) => {
    const maybeWords = MaybeT.of(a)
        .bindErr("No Arethusa.", Arethusa.deepcopy)
        .fmapErr("No words in Arethusa.", Arethusa.words)
        .unpackT([])
        .map((w, idx) => MaybeT.ofThrow("Could not create Maybe<Word>.", DXML.node(w))
        .fmapErr("Could not make word node.", XML.setId(Str.fromNum(idx + 1)))
        .fmapErr("Could not set ID.", ArethusaWord.fromXMLNode));
    const words = Arr.removeNothings(maybeWords);
    return head(words)
        .fmapErr("No first node.", DXML.node)
        .bindErr("No node.", XML.ownerDocument)
        .bindErr("No owner document", XML.documentElement)
        .bindErr("No document element.", Arethusa.fromNode);
};
Arethusa.replaceSentence = (a) => (newS) => {
    const newSXML = DXML.node(newS);
    const sentenceNodes = Arethusa
        .deepcopy(a)
        .fmap(Arethusa.sentences)
        .unpackT([])
        .map(DXML.node);
    const newSentences = ArethusaSentence
        .id(newS)
        .fmap(flip(Arethusa.sentenceNodeIdxById)(a))
        .fmap(Arr.replaceByIdx(sentenceNodes)(newSXML))
        .unpackT([])
        .map(ArethusaSentence.fromXMLNode);
    return Arethusa.fromSentences(newSentences);
};
Arethusa.sentences = (a) => {
    const getSentences = XML.xpath(ArethusaSentence.xpathAddress);
    return MaybeT.of(a)
        .fmap(DXML.node)
        .bind(getSentences)
        .unpackT([])
        .map(ArethusaSentence.fromXMLNode);
};
Arethusa.sentenceById = (id) => (a) => {
    const sentence = Arethusa
        .sentenceNodeById(id)(a)
        .fmap(ArethusaSentence.fromXMLNode);
    return sentence;
};
Arethusa.sentenceNodeById = (id) => (a) => {
    const sentence = XML
        .xpathMaybe(ArethusaSentence.xpathAddress + `[@id='${id}']`)(a.doc)
        .bind(head);
    return sentence;
};
Arethusa.sentenceNodeIdxById = (id) => (a) => {
    return MaybeT.of(a)
        .fmap(Arethusa.sentences)
        .unpackT([])
        .map(DXML.node)
        .findIndex((node) => {
        return XML.attrVal("id")(node).eq(id);
    });
};
Arethusa.sentenceByWordId = (id) => (a) => {
    const sentence = XML.xpathMaybe(ArethusaWord.parentSentenceAddress(id))(a.doc)
        .bind(head)
        .fmap(ArethusaSentence.fromXMLNode);
    return sentence;
};
Arethusa.sentenceIdByWordId = (id) => (a) => {
    return Arethusa.sentenceByWordId(id)(a)
        .bind(ArethusaSentence.id);
};
Arethusa.splitSentenceAt = (startWordId) => (a) => {
    const moveReduce = (_a, wordId) => {
        const newArethusa = _a.bind(Arethusa.deepcopy);
        return newArethusa.bind(Arethusa.moveWordToNextSentence(wordId));
    };
    const nextWordIds = Arethusa
        .sentenceByWordId(startWordId)(a)
        .fmap(ArethusaSentence.nextWordIds(startWordId))
        .unpackT([]);
    const currentSentenceId = Arethusa
        .sentenceIdByWordId(startWordId)(a);
    // const startForIncrement = currentSentenceId
    //     .fmap(Str.increment)
    //     .fmap(Str.increment)
    const insertSentence = MaybeT.of(a)
        .bind(Arethusa.sentenceIdByWordId(startWordId))
        .fmap(Arethusa.insertSentenceAfter);
    const arethusaWithNewSentenceAndIds = MaybeT.of(a)
        .applyBind(insertSentence);
    // .applyBind(startForIncrement.fmap(Arethusa.incrementSentenceIdsFrom))
    return Arr
        .reverse([startWordId].concat(nextWordIds))
        .reduce(moveReduce, arethusaWithNewSentenceAndIds);
};
Arethusa.words = (a) => {
    return Arethusa
        .sentences(a)
        .map(DXML.node)
        .flatMap(XML.childNodes)
        .filter((node) => node.nodeName === "word")
        .map(ArethusaWord.fromXMLNode);
};
Arethusa.wordById = (id) => (a) => {
    return XML.xpathMaybe(ArethusaWord.xpathAddress + `[@id='${id}']`)(a.doc)
        .bind(head)
        .fmap(ArethusaWord.fromXMLNode);
};
