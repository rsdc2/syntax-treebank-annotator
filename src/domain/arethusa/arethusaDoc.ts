class ArethusaDoc implements ArethusaSentenceable, Wordable {
    _node: XMLNode

    constructor(node: XMLNode) {
        this._node = node
    }

    static appendSentence = (a: ArethusaDoc) => {
        return ArethusaDoc
            .appendSentenceWithId 
                (ArethusaDoc.newNextSentenceId(a)) 
                (a)
    }

    static appendSentenceWithId = (sentenceId: string) => (a: ArethusaDoc) => {
        const id = {"id": sentenceId}
        const sentenceElement = a
            .docCopy
            .fmap(XML.createElement("sentence")(id))

        const appendSentence = sentenceElement
            .fmap(XML.appendChildToNode)

        return a
            .docCopy
            .bind(XML.firstDocChild)
            .applyBind(appendSentence)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static appendSentenceFromPlainTextStr = (s: string) => (a: ArethusaDoc) => {
        const sentence = ArethusaDoc
            .appendSentence(a)
            .bind(ArethusaDoc.lastSentence)

        const words = MaybeT.of(s)
            .fmapErr("Error with string.", Str.split(" "))
            .unpackT([])
            .map(Str.strip)
        
        return sentence.bind(ArethusaSentence.appendWords(words))
    }

    static appendEmptyWord (a: ArethusaDoc): Maybe<ArethusaDoc> {

        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs({}))                        
    }

    static appendWord = (attrs: object) => (a: ArethusaDoc) => {

        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs))      

    }

    static appendWordToSentence = (attrs: object) => (sentenceId: string) => (a: ArethusaDoc) => {
        return ArethusaDoc
            .sentenceById (sentenceId) (a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs))
    }


    static deepcopy = (a: ArethusaDoc) => {
        return a
            .docCopy
            .bind(ArethusaDoc.fromNode)
    }

    get doc(): Maybe<XMLDocument | XMLNode> {
        if (XML.isDocument(this.node)) {
            return MaybeT.of(this.node)
        }
        return MaybeT.of(this._node.ownerDocument)
    }

    get docCopy() {
        return this.doc.fmap(XML.deepcopy)
    }

    /**
     * 
     * @param a Arethusa
     * @returns the value of the id attribute of the \<document_meta\> node.
     */

    static docId = (a: ArethusaDoc) => {
        return MaybeT.of(a)
            .fmap(DXML.node)
            .bind(XML.xpath(".//document_meta"))
            .bind(Arr.head)
            .bind(XML.attrVal('id'))
    }

    /**
     * 
     * @param a Arethusa
     * @returns \<document_meta\> node from the Arethusa document.
     */

    static documentMeta = (a: ArethusaDoc) => {
        return MaybeT.of(a)
            .fmap(DXML.node)
            .bind(XML.xpath(".//document_meta"))
            .bind(Arr.head)
    }

    static ensureSentence = (sentenceId: string) => (a: ArethusaDoc) => {
        if (ArethusaDoc.hasSentence(sentenceId) (a)) {
            return MaybeT.of(a)
        }
        return ArethusaDoc.appendSentence(a)
    }

    static firstSentence(a: ArethusaDoc): Maybe<Wordable> {
        return Arr.head (a.sentences)
    }

    static fromNode = (node: XMLNode) => {
        return MaybeT.of(new ArethusaDoc(node))
    }

    static fromSentences = (sentences: ArethusaSentence[]) => {
        const sentenceNodes = sentences
            .map(DXML.node)

        return MaybeT.of(XML
            .fromXMLStr(arethusaTemplate))
            .bind(XML.firstChild)
            .bind(XML.appendChildrenToNode(sentenceNodes))
            .bind(ArethusaDoc.fromNode)
    }

    static fromPlainTextStr = (plainText: string) => {
        const arethusaXMLNode = MaybeT
            .of(XML.fromXMLStr(arethusaTemplate))
            .bind(XML.documentElement)

        const arethusa = arethusaXMLNode
            .bind(ArethusaDoc.fromNode)

        const getSentenceElem = arethusa
            .fmap(ArethusaSentence.XMLStrFromPlainTextStr)
            .unpack(null)

        if (getSentenceElem === null) {
            console.error("Could not create getSentenceElem function.")
            return arethusa
        }

        const sentenceStrs = MaybeT.of(plainText)
            .fmapErr("Error in plainText input.", Str.split(/[\.\?\;\:]/g))
            .unpackT([])
            .map(Str.replace(/\,/g) (""))
            .map(Str.strip)

        const sentenceElems = Arr
            .removeEmptyStrs(sentenceStrs)
            .map(getSentenceElem)

        const sentenceElemsNoNothings = Arr.removeNothings(sentenceElems)

        const arethusaXMLNodeWithChildren = arethusaXMLNode
            .bind(XML.appendChildrenToNode(sentenceElemsNoNothings))

        return arethusaXMLNodeWithChildren
            .bind(ArethusaDoc.fromNode)
            .bind(ArethusaDoc.reorderSentenceIds)
            .bind(ArethusaDoc.reorderWordIds)
    }

    static fromXMLStr = (arethusaXML: string) => {
        return MaybeT.of(arethusaXML)
            .fmap(XML.fromXMLStr)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static incrementSentenceIdsFrom = (startSentenceId: string) => (a: ArethusaDoc) => {
        const reduceIncrement = (a: Maybe<ArethusaDoc>, id: string) => {
            const s = a.bind(ArethusaDoc.sentenceById(id))
            return s
                .bind(ArethusaSentence.incrementId)
                .bind(ArethusaDoc.parentArethusa)
        }

        return ArethusaDoc
            .nextSentenceIds(startSentenceId)(a)
            .reduce(reduceIncrement, MaybeT.of(a))
    }

    static insertSentence = 
        (insertFunc: (nodeToInsert: Node | Element | Text) => (refNode: Node) => Maybe<ParentNode>) => 
        (refSentenceId: string) => 
        (a: ArethusaDoc) => 
    {

        const id = {"id": Str.increment(refSentenceId)}
        const sentenceElement = a
            .docCopy
            .fmap(XML.createElement("sentence")(id))

        const insertSentence = sentenceElement
            .fmap(insertFunc)

        const newArethusa = MaybeT.of(a)
            .bind(ArethusaDoc.deepcopy)
            .bind(ArethusaDoc.sentenceById(refSentenceId))
            .fmap(DXML.node)
            .applyBind(insertSentence)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)

        return newArethusa.bind(ArethusaDoc.reorderSentenceIds)    
    }

    static insertSentenceAfter = (refSentenceId: string) => (a: ArethusaDoc): Maybe<ArethusaDoc> => {
        return ArethusaDoc.insertSentence(XML.insertAfter)(refSentenceId)(a)
    }

    static insertSentenceBefore = (refSentenceId: string) => (a: ArethusaDoc): Maybe<ArethusaDoc> => {
        return ArethusaDoc.insertSentence(XML.insertBefore)(refSentenceId)(a)
    }

    static lastSentence(a: ArethusaDoc): Maybe<Wordable> {
        return Arr.last (a.sentences)
    }

    static lastWord = (a: ArethusaDoc) => {
        return MaybeT.of(a)
            .fmap(ArethusaDoc.words)
            .bind(Arr.last)
    }

    static hasSentence = (sentenceId: string) => (a: ArethusaDoc) => {
        const sentence = ArethusaDoc.sentenceById (sentenceId) (a)
        return sentence.value !== Nothing.of().value
    }

    static newNextSentenceId(a: ArethusaDoc) {
        return ArethusaDoc
            .lastSentence(a)
            .bind(ArethusaSentence.id)
            .fmap(Str.increment)
            .unpack("1")
    }

    static nextWordId(arethusa: ArethusaDoc) {
        const nextId = ArethusaDoc
            .lastWord(arethusa)
            .bind(ArethusaWord.id)
            .fmap(Str.increment)

        return nextId.unpack("1")
    }

    get node(): XMLNode {
        return this._node
    }

    static parentArethusa(sentence: ArethusaSentence) {
        return MaybeT.of(sentence)
            .fmap(DXML.node)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    get sentences(): ArethusaSentence[] {
        return ArethusaDoc.sentences(this)
    }

    static pushToFrontend = (textStateIO: TextStateIO) => {
        const outputArethusaXML = textStateIO
            .outputArethusaXML
            .unpack("")

        const inputArethusaXML = textStateIO
            .inputArethusaXML
            .unpack("")

        // console.log("inputArethusaXML", inputArethusaXML)

        if (inputArethusaXML.includes("parsererror")) {
            Frontend
                .arethusaInputTextArea
                .fmap( Frontend.updateTextArea("") ) 

            Frontend.showMessage("Input Arethusa is not valid XML.")

        } else {
            Frontend.hideMessage()
            Frontend
                .arethusaInputTextArea
                .fmap( Frontend.updateTextArea(inputArethusaXML) ) 
        }
        
        if (outputArethusaXML.includes("parsererror")) {
            Frontend
                .arethusaOutputDiv
                .fmap(Frontend.updateArethusaDiv ("") (Nothing.of()))
        } else {
            const highlighted = textStateIO
                .highlightedNodeStr

            Frontend
                .arethusaOutputDiv
                .fmap(Frontend.updateArethusaDiv (outputArethusaXML) (highlighted))
        }
    }

    static pushWordToSentence = 
        (addFunc: (word: ArethusaWord) => (sentence: ArethusaSentence) => Maybe<ArethusaDoc>) => 
        (wordId: string) => 
        (newSentenceId: string) =>
        (a: ArethusaDoc) => {

        const currentWord = ArethusaDoc
            .wordById(wordId)(a)

        const getThisSentence = currentWord
            .bind(ArethusaWord.parentSentenceId)
            .fmap(ArethusaDoc.sentenceById)     

        const addWord = currentWord.fmap(addFunc)

        const newSentence = MaybeT.of(a)
            .bind(ArethusaDoc.ensureSentence (newSentenceId))
            .bind(ArethusaDoc.sentenceById (newSentenceId))
            
        const newArethusa = newSentence
            .applyBind(addWord)

        const thisSentence = newArethusa
            .bind(ArethusaDoc.deepcopy)
            .applyBind(getThisSentence)   
                        
        const newArethusa2 = thisSentence
            .bind(ArethusaSentence.removeWordById(wordId))
        
        return newArethusa2
    }

    static moveWordToNextSentence = (wordId: string) => (a: ArethusaDoc) => {
        const thisSentenceId = MaybeT.of(a)
            .bind(ArethusaDoc.wordById(wordId))
            .bind(ArethusaWord.parentSentenceId)

        const nextSentenceId = thisSentenceId
            .fmap(Str.increment)

        const prependWordToNextSentence = nextSentenceId
            .fmap(ArethusaDoc.pushWordToSentence (ArethusaSentence.prependWord) (wordId))

        return MaybeT.of(a).applyBind(prependWordToNextSentence)
    }

    static moveWordToPrevSentence = (wordId: string) => (a: ArethusaDoc) => {
        const thisSentenceId = MaybeT.of(a)
            .bind(ArethusaDoc.wordById(wordId))
            .bind(ArethusaWord.parentSentenceId)

        const prevSentenceId = thisSentenceId
            .fmap(Str.decrement)

        const appendWordToPrevSentence = prevSentenceId
            .fmap(ArethusaDoc.pushWordToSentence (ArethusaSentence.appendWord) (wordId))

        return MaybeT.of(a)
            .applyBind(appendWordToPrevSentence)
    }

    static nextSentenceIds = (startSentenceId: string) => (a: ArethusaDoc): string[] => {
        return ArethusaDoc
            .sentenceById (startSentenceId) (a)
            .fmap(DXML.node)
            .bind(XML.nextSiblingElements)
            .unpackT([])
            .map(ArethusaSentence.fromXMLNode)
            .map(ArethusaSentence.id)
            .filter( (item: Maybe<string>) => item.isSomething ) 
            .map( (item: Maybe<string>) => item.value as string )
    }

    static _removeWordOrSentence = (id: string) => (a: ArethusaDoc) => (entity: ArethusaWord | ArethusaSentence) => {
        const entityNode = MaybeT.of(entity)
            .fmap(DXML.node)

        const removeSentenceNode = entityNode
            .fmap(XML.removeChild)

        const entityParentNode = entityNode.bind(XML.parent)
        
        const newParent = entityParentNode
            .applyFmap(removeSentenceNode)
        
        return newParent
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static removeSentenceById = (id: string) => (a: ArethusaDoc) => {
        return ArethusaDoc
            .sentenceById (id) (a)
            .bind(ArethusaDoc._removeWordOrSentence (id) (a))
    }

    static removeWordByWordAndSentenceId = (wordId: string) => (sentenceId: string) => (a: ArethusaDoc) => {
        return ArethusaSentence
            .wordByWordAndSentenceId (wordId) (sentenceId) (a)
            .bind(ArethusaDoc._removeWordOrSentence (wordId) (a))
    }

    static reorderSentenceIds = (a: ArethusaDoc) => {
        const maybeSentences = MaybeT.of(a)
            .bind(ArethusaDoc.deepcopy)
            .fmap(ArethusaDoc.sentences)
            .unpackT([])
            .map( (s: ArethusaSentence, idx: number) => 
                MaybeT.of(DXML.node(s))
                    .fmap(XML.setId(Str.fromNum(idx + 1)))
                    .fmap(ArethusaSentence.fromXMLNode)
            )
        
        const sentences = Arr.removeNothings(maybeSentences)
        return ArethusaDoc.fromSentences(sentences)
    }

    static reorderWordIds = (a: ArethusaDoc): Maybe<ArethusaDoc> => {
        const maybeWords = MaybeT.of(a)
            .bindErr("No Arethusa.", ArethusaDoc.deepcopy)
            .fmapErr("No words in Arethusa.", ArethusaDoc.words)
            .unpackT([])
            .map( (w: ArethusaWord, idx: number) => 
                MaybeT.ofThrow("Could not create Maybe<Word>.", DXML.node(w))
                    .fmapErr("Could not make word node.", XML.setId(Str.fromNum(idx + 1)))
                    .fmapErr("Could not set ID.", ArethusaWord.fromXMLNode)
            )

        const words = Arr.removeNothings(maybeWords)
        return Arr.head(words)
            .fmapErr("No first node.", DXML.node)
            .bindErr("No node.", XML.ownerDocument)
            .bindErr("No owner document", XML.documentElement)
            .bindErr("No document element.", ArethusaDoc.fromNode)
    }

    static replaceSentence = (a: ArethusaDoc) => (newS: ArethusaSentence) => {

        const newSXML = DXML.node(newS)

        const sentenceNodes = ArethusaDoc
            .deepcopy(a)
            .fmap(ArethusaDoc.sentences)
            .unpackT([])
            .map(DXML.node)

        const newSentences = ArethusaSentence
            .id(newS)
            .fmap(flip(ArethusaDoc.sentenceNodeIdxById)(a))
            .fmap(Arr.replaceByIdx(sentenceNodes)(newSXML))
            .unpackT([])
            .map(ArethusaSentence.fromXMLNode)

        return ArethusaDoc.fromSentences(newSentences)

    }

    static sentences = (a: ArethusaDoc) => {
        const getSentences = XML.xpath (ArethusaSentence.xpathAddress) 
        return MaybeT.of(a)
            .fmap(DXML.node)
            .bind(getSentences)
            .unpackT([])
            .map(ArethusaSentence.fromXMLNode)
    }

    static sentenceById = (id: string) => (a: ArethusaDoc) => {
        const sentence = ArethusaDoc
            .sentenceNodeById(id)(a)
            .fmap(ArethusaSentence.fromXMLNode)

        return sentence
    }

    static sentenceNodeById = (id: string) => (a: ArethusaDoc) => {
        const sentence = XML
            .xpathMaybe(ArethusaSentence.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head)

        return sentence
    }

    static sentenceNodeIdxById = (id: string) => (a: ArethusaDoc) => {
        return MaybeT.of(a)
            .fmap(ArethusaDoc.sentences)
            .unpackT([])
            .map(DXML.node)
            .findIndex(
                (node: Node) => {
                    return XML.attrVal("id")(node).eq(id)
                }
            )
    }

    static sentenceByWordId = (id: string) => (a: ArethusaDoc) => {
        const sentence = XML.xpathMaybe(ArethusaWord.parentSentenceAddress (id)) (a.doc)
            .bind(Arr.head)
            .fmap(ArethusaSentence.fromXMLNode)

        return sentence
    }

    static sentenceIdByWordId = (id: string) => (a: ArethusaDoc) => {
        return ArethusaDoc.sentenceByWordId (id) (a)
            .bind(ArethusaSentence.id)
    }

    /**
     * Sets the id attribute of the <document_meta> node.
     * Makes the change in place.
     * @param id string
     * @param a Arethusa
     * @returns Maybe\<Arethusa\>
     */
    static setDocId = (id: string) => (a: ArethusaDoc) => {
        return MaybeT.of(a)
            .bind(ArethusaDoc.documentMeta)
            .fmap(XML.setAttr('id')(id))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static splitSentenceAt = (startWordId: string) => (a: ArethusaDoc) => {

        const moveReduce = (_a: Maybe<ArethusaDoc>, wordId: string) => {
            const newArethusa = _a.bind(ArethusaDoc.deepcopy)
            return newArethusa.bind(ArethusaDoc.moveWordToNextSentence(wordId))
        } 

        const nextWordIds = ArethusaDoc
            .sentenceByWordId (startWordId) (a)
            .fmap(ArethusaSentence.nextWordIds (startWordId))
            .unpackT([])

        const currentSentenceId = ArethusaDoc
            .sentenceIdByWordId(startWordId)(a)
        
        // const startForIncrement = currentSentenceId
        //     .fmap(Str.increment)
        //     .fmap(Str.increment)

        const insertSentence = MaybeT.of(a)
            .bind(ArethusaDoc.sentenceIdByWordId(startWordId))
            .fmap(ArethusaDoc.insertSentenceAfter)

        const arethusaWithNewSentenceAndIds = MaybeT.of(a)
            .applyBind(insertSentence)
            // .applyBind(startForIncrement.fmap(Arethusa.incrementSentenceIdsFrom))

        return Arr
            .reverse([startWordId].concat(nextWordIds))
            .reduce(moveReduce, arethusaWithNewSentenceAndIds)       
    }

    get text(): Maybe<string> {
        return MaybeT.of(this.node.textContent)
    }

    static toXMLStr(a: ArethusaDoc) {
        return XML.toStr(a.node)
    }

    static words = (a: ArethusaDoc) => {
        return ArethusaDoc
            .sentences(a)
            .map(DXML.node)
            .flatMap(XML.childNodes)
            .filter( (node:Node) => node.nodeName === "word" )
            .map(ArethusaWord.fromXMLNode)
    }

    static wordById = (id: string) => (a: ArethusaDoc) => {
        return XML.xpathMaybe(ArethusaWord.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head)
            .fmap(ArethusaWord.fromXMLNode)
    }

    get wordsProp(): ArethusaWord[] {
        return ArethusaDoc.words(this)
    }

}

