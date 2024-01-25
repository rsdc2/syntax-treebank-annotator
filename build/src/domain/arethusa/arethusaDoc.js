class ArethusaDoc {
    _node;
    _element;
    constructor(node) {
        this._node = node;
        this._element = this._element = DOM.Node_.element(node).fromMaybeErr();
    }
    static appendArtificial = (attrs) => (a) => {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.appendArtificialToSentenceFromAttrs(attrs));
    };
    static appendArtificialToSentence = (attrs) => (sentenceId) => (a) => {
        return ArethusaDoc
            .sentenceById(sentenceId)(a)
            .bind(ArethusaSentence.appendArtificialToSentenceFromAttrs(attrs));
    };
    static appendSentence = (a) => {
        const lang = ArethusaDoc.lastSentence(a)
            .bind(ArethusaSentence.lang)
            .fromMaybe("");
        return ArethusaDoc
            .appendSentenceWithId(ArethusaDoc.newNextSentenceId(a), "")(lang)(a);
    };
    static appendSentences = (sentences) => (a) => {
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
    static appendSentenceWithId = (sentenceId, notes) => (lang) => (a) => {
        const attrs = { "id": sentenceId, "xml:lang": lang, "notes": notes };
        const sentenceElement = a
            .docCopy
            .fmap(XML.createElement("sentence")(attrs));
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
    static appendSentenceFromPlainTextStr = (lang) => (s) => (a) => {
        const sentence = ArethusaDoc
            .appendSentence(a)
            .bind(ArethusaDoc.lastSentence);
        const words = MaybeT.of(s)
            .fmapErr("Error with string.", Str.split(" "))
            .fromMaybe([])
            .map(Str.strip);
        return sentence.bind(ArethusaSentence.appendWords(words));
    };
    static appendEmptyWord(a) {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(ArethusaWord.createAttrs("---")));
    }
    static appendWord = (attrs) => (a) => {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs));
    };
    static appendWordToSentence = (attrs) => (sentenceId) => (a) => {
        return ArethusaDoc
            .sentenceById(sentenceId)(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs));
    };
    get attrs() {
        return this._element.attributes;
    }
    static deepcopy = (a) => {
        return a
            .docCopy
            .bind(ArethusaDoc.fromNode);
    };
    get doc() {
        if (XML.isDocument(this.node)) {
            return MaybeT.of(this.node);
        }
        return MaybeT.of(this._node.ownerDocument);
    }
    get docCopy() {
        return this.doc.fmap(XML.deepcopy);
    }
    /**
     *
     * @param a Arethusa
     * @returns the value of the id attribute of the \<document_meta\> node.
     */
    static docId = (a) => {
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
    static documentMeta = (a) => {
        return MaybeT.of(a)
            .fmap(DXML.node)
            .bind(XML.xpath(".//document_meta"))
            .bind(Arr.head);
    };
    static ensureSentence = (sentenceId) => (a) => {
        if (ArethusaDoc.hasSentence(sentenceId)(a)) {
            return MaybeT.of(a);
        }
        return ArethusaDoc.appendSentence(a);
    };
    static firstSentence(a) {
        return Arr.head(a.sentences);
    }
    static fromNode = (node) => {
        return MaybeT.of(new ArethusaDoc(node));
    };
    static fromSentences = (sentences) => {
        const sentenceNodes = sentences
            .map(DXML.node);
        return MaybeT.of(XML
            .fromXMLStr(arethusaTemplate))
            .bind(XML.firstChild)
            .bind(XML.appendChildrenToNode(sentenceNodes))
            .bind(ArethusaDoc.fromNode);
    };
    static fromPlainTextStr = (plainText) => {
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
            .bind(ArethusaDoc.renumberSentenceIds)
            .bind(ArethusaDoc.renumberTokenIds(false));
    };
    static fromXMLStr = (arethusaXML) => {
        return MaybeT.of(arethusaXML)
            .fmap(XML.fromXMLStr)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static incrementSentenceIdsFrom = (startSentenceId) => (a) => {
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
    static insertSentence = (insertFunc) => (refSentenceId) => (a) => {
        const lang = ArethusaDoc.sentenceById(refSentenceId)(a)
            .bind(ArethusaSentence.lang)
            .fromMaybe("");
        const attrs = { "id": Str.increment(refSentenceId), "notes": "", "xml:lang": lang };
        const sentenceElement = a
            .docCopy
            .fmap(XML.createElement("sentence")(attrs));
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
        return newArethusa.bind(ArethusaDoc.renumberSentenceIds);
    };
    static insertSentenceAfter = (refSentenceId) => (a) => {
        return ArethusaDoc.insertSentence(XML.insertAfter)(refSentenceId)(a);
    };
    static insertSentenceBefore = (refSentenceId) => (a) => {
        return ArethusaDoc.insertSentence(XML.insertBefore)(refSentenceId)(a);
    };
    static lastSentence(a) {
        return Arr.last(a.sentences);
    }
    static lastToken = (a) => {
        return MaybeT.of(a)
            .fmap(ArethusaDoc.tokens)
            .bind(Arr.last);
    };
    static lastWord = (a) => {
        return MaybeT.of(a)
            .fmap(ArethusaDoc.words)
            .bind(Arr.last);
    };
    static hasSentence = (sentenceId) => (a) => {
        const sentence = ArethusaDoc.sentenceById(sentenceId)(a);
        return sentence.value !== Nothing.of().value;
    };
    static newNextSentenceId(a) {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.id)
            .fmap(Str.increment)
            .unpack("1");
    }
    static nextTokenId = (arethusa) => {
        const nextId = ArethusaDoc
            .lastToken(arethusa)
            .bind(ArethusaToken.id)
            .fmap(Str.increment);
        return nextId.unpack("1");
    };
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
    static pushToFrontend = (textStateIO) => {
        const outputArethusa = textStateIO.outputArethusaP;
        const outputArethusaXML = textStateIO
            .outputArethusaXML
            .unpack("");
        const inputArethusaXML = textStateIO
            .inputArethusaXML
            .unpack("");
        if (inputArethusaXML.includes("parsererror")) {
            Frontend
                .arethusaInputTextArea
                .fmap(Frontend.updateTextArea("ERROR: invalid XML"));
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
                .fmap(Frontend.updateArethusaDiv(outputArethusaXML)(Nothing.of()));
        }
        else {
            const highlightedNode = textStateIO.highlightedNode;
            Frontend
                .arethusaOutputDiv
                .fmap(Frontend.updateArethusaDiv(outputArethusaXML)(highlightedNode));
        }
    };
    static pushTokenToSentence = (addFunc) => (tokenId) => (newSentenceId) => (a) => {
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
    static moveTokenToNextSentence = (tokenId) => (a) => {
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
    static moveTokenToPrevSentence = (wordId) => (a) => {
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
    static nextSentenceIds = (startSentenceId) => (a) => {
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
    static _removeTokenOrSentence = (id) => (a) => (entity) => {
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
    static removeSentenceById = (id) => (a) => {
        return ArethusaDoc
            .sentenceById(id)(a)
            .bind(ArethusaDoc._removeTokenOrSentence(id)(a));
    };
    static removeSentences = (a) => {
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
    static removeTokenByTokenAndSentenceId = (wordId) => (sentenceId) => (a) => {
        return ArethusaSentence
            .tokenByTokenAndSentenceId(wordId)(sentenceId)(a)
            .bind(ArethusaDoc._removeTokenOrSentence(wordId)(a));
    };
    static renumberSentenceIds = (a) => {
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
    static renumberTokenIds = (renumberHeads) => (a) => {
        const changes = new Array(); // Stores a map of id changes from old to new
        const maybeWords = MaybeT.of(a)
            .bindErr("No Arethusa.", ArethusaDoc.deepcopy)
            .fmapErr("No words in Arethusa.", ArethusaDoc.tokens)
            .unpack([])
            .map((w, idx) => {
            const currentId = XML.attr("id")(DXML.node(w))
                .bind(XML.textContent) // TODO: use a better function for this
                .fmap(Str.toNum)
                .unpack(idx);
            const newId = idx + 1;
            // Push change to array of changes
            const tokenSentenceId = MaybeT.of(w)
                .fmap(DXML.node)
                .bind(XML.parent)
                .bind(XML.attr("id"))
                .bind(XML.nodeValue)
                .unpack("");
            changes.push([tokenSentenceId, Str.fromNum(currentId), Str.fromNum(newId)]);
            // console.log(changes)
            // Renumber token ids
            const newToken = MaybeT.ofThrow("Could not create Maybe<Word>.", DXML.node(w))
                .fmapErr("Could not make word node.", XML.setId(Str.fromNum(newId)))
                .fmapErr("Could not set ID.", ArethusaToken.fromXMLNode);
            return newToken;
        });
        const words = Arr.removeNothings(maybeWords);
        let words_ = words;
        if (renumberHeads) {
            words_ = words.map((w) => {
                const wordHead = XML.attr("head")(DXML.node(w))
                    .bind(XML.textContent) // TODO: use a better function for this
                    .unpack("");
                const tokenSentenceId = MaybeT.of(w) // TODO: make general version of this function
                    .fmap(DXML.node)
                    .bind(XML.parent)
                    .bind(XML.attr("id"))
                    .bind(XML.nodeValue)
                    .unpack("");
                let w_;
                // Loop through array of changes and change heads 
                // and secondary deps accordingly
                changes.forEach(([sentId, oldId, newId]) => {
                    const newSecDeps = XML.attr("secdeps")(DXML.node(w))
                        .bind(XML.textContent) // TODO: use a better function for this
                        .fmap((s1) => {
                        if (s1.trim() === "" || s1.trim() === "_") {
                            return s1;
                        }
                        if (s1.trim() === "_") {
                            return "_";
                        }
                        return Str.split(";")(s1)
                            .map((s2) => {
                            const head_rel = Str.split(":")(s2);
                            if (head_rel.length === 0) {
                                return s2;
                            }
                            else if (head_rel.length <= 1) {
                                console.error("Head-rel string has too few elements");
                            }
                            else if (head_rel.length > 2) {
                                console.error("Head-rel string has too many elements");
                            }
                            const head = head_rel[0];
                            const rel = head_rel[1];
                            if (head === "0" || head !== oldId || tokenSentenceId !== sentId) {
                                return s2;
                            }
                            return `£${newId}:${rel}`; // include '£' marker to stop matches once change made
                        })
                            .join(";");
                    }).unpack("");
                    const newNode = DXML.node(w); // TODO: render the type definition unnecessary
                    if (wordHead === oldId && wordHead !== "0" && tokenSentenceId === sentId) {
                        newNode.setAttribute("head", newId);
                    }
                    newNode.setAttribute("secdeps", newSecDeps);
                    w_ = ArethusaToken.fromXMLNode(newNode);
                });
                return w_;
            });
        }
        // Replace marker text in secdeps
        const words__ = words_.map((w) => {
            const node = DXML.node(w);
            const headId = XML.attr("secdeps")(node)
                .bind(XML.textContent)
                .unpack("")
                .replace(/£/g, "");
            const newNode = XML.setAttr("secdeps")(headId)(node);
            return ArethusaToken.fromXMLNode(newNode);
        });
        return Arr.head(words__)
            .fmapErr("No first node.", DXML.node)
            .bindErr("No node.", XML.ownerDocument)
            .bindErr("No owner document", XML.documentElement)
            .bindErr("No document element.", ArethusaDoc.fromNode);
    };
    static replaceSentence = (a) => (newSentence) => {
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
    static sentences = (a) => {
        const getSentences = XML.xpath(ArethusaSentence.xpathAddress);
        return MaybeT.of(a)
            .fmap(DXML.node)
            .bind(getSentences)
            .fromMaybe([])
            .map(ArethusaSentence.fromXMLNode);
    };
    static sentenceById = (id) => (a) => {
        const sentence = ArethusaDoc
            .sentenceNodeById(id)(a)
            .fmap(ArethusaSentence.fromXMLNode);
        return sentence;
    };
    static sentenceNodeById = (id) => (a) => {
        const sentence = XML
            .xpathMaybe(ArethusaSentence.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head);
        return sentence;
    };
    static sentenceNodeIdxById = (id) => (a) => {
        return MaybeT.of(a)
            .fmap(ArethusaDoc.sentences)
            .fromMaybe([])
            .map(DXML.node)
            .findIndex((node) => {
            return XML.attrVal("id")(node).eq(id);
        });
    };
    static sentenceByTokenId = (id) => (a) => {
        const sentence = XML
            .xpathMaybe(ArethusaWord.parentSentenceAddress(id))(a.doc)
            .bind(Arr.head)
            .fmap(ArethusaSentence.fromXMLNode);
        return sentence;
    };
    static sentenceIdByTokenId = (id) => (a) => {
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
    static setDocId = (id) => (a) => {
        return MaybeT.of(a)
            .bind(ArethusaDoc.documentMeta)
            .fmap(XML.setAttr('id')(id))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode);
    };
    static splitSentenceAt = (startTokenId) => (a) => {
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
    get text() {
        return MaybeT.of(this.node.textContent);
    }
    static tokenById = (id) => (a) => {
        return XML.xpathMaybe(ArethusaToken.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head)
            .fmap(ArethusaToken.fromXMLNode);
    };
    static tokens = (a) => {
        return ArethusaDoc
            .sentences(a)
            .map(DXML.node)
            .flatMap(XML.childNodes)
            .filter((node) => node.nodeName === "word")
            .map(ArethusaWord.fromXMLNode);
    };
    static toXMLStr(a) {
        return XML.toStr(a.node);
    }
    static words = (a) => {
        return ArethusaDoc
            .sentences(a)
            .map(DXML.node)
            .flatMap(XML.childNodes)
            .filter((node) => node.nodeName === "word")
            .filter((node) => XML.hasAttr('lemma')(node) === true)
            .map(ArethusaWord.fromXMLNode);
    };
    static wordById = (id) => (a) => {
        return XML.xpathMaybe(ArethusaWord.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head)
            .fmap(ArethusaWord.fromXMLNode);
    };
    get tokens() {
        return ArethusaDoc.words(this);
    }
}
