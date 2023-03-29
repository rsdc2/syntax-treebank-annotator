interface ArethusaSentenceable extends Nodeable {
    sentences: Wordable[]
}


class Arethusa implements ArethusaSentenceable, Wordable {
    _node: XMLNode

    constructor(node: XMLNode) {
        this._node = node
    }

    static appendSentence = (a: Arethusa) => {
        return Arethusa
            .appendSentenceWithId 
                (Arethusa.newNextSentenceId(a)) 
                (a)
    }

    static appendSentenceWithId = (sentenceId: string) => (a: Arethusa) => {
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
            .bind(Arethusa.fromNode)
    }

    static appendSentenceFromPlainTextStr = (s: string) => (a: Arethusa) => {
        const sentence = Arethusa
            .appendSentence(a)
            .bind(Arethusa.lastSentence)

        const words = MaybeT.of(s)
            .fmapErr("Error with string.", Str.split(" "))
            .unpackT([])
            .map(Str.strip)
        
        return sentence.bind(ArethusaSentence.appendWords(words))
    }

    static appendEmptyWord (a: Arethusa): Maybe<Arethusa> {

        return Arethusa
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs({}))                        
    }

    static appendWord = (attrs: object) => (a: Arethusa) => {

        return Arethusa
            .lastSentence(a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs))      

    }

    static appendWordToSentence = (attrs: object) => (sentenceId: string) => (a: Arethusa) => {
        return Arethusa
            .sentenceById (sentenceId) (a)
            .bind(ArethusaSentence.appendWordToSentenceFromAttrs(attrs))
    }


    static deepcopy = (a: Arethusa) => {
        return a
            .docCopy
            .bind(Arethusa.fromNode)
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

    static ensureSentence = (sentenceId: string) => (a: Arethusa) => {
        if (Arethusa.hasSentence(sentenceId) (a)) {
            return MaybeT.of(a)
        }
        return Arethusa.appendSentence(a)
    }

    static firstSentence(a: Arethusa): Maybe<Wordable> {
        return Arr.head (a.sentences)
    }

    static fromNode = (node: XMLNode) => {
        return MaybeT.of(new Arethusa(node))
    }

    static fromSentences = (sentences: ArethusaSentence[]) => {
        const sentenceNodes = sentences
            .map(DXML.node)

        return MaybeT.of(XML
            .fromXMLStr(arethusaTemplate))
            .bind(XML.firstChild)
            .bind(XML.appendChildrenToNode(sentenceNodes))
            .bind(Arethusa.fromNode)
    }

    static fromPlainTextStr = (plainText: string) => {
        const arethusaXMLNode = MaybeT
            .of(XML.fromXMLStr(arethusaTemplate))
            .bind(XML.documentElement)

        const arethusa = arethusaXMLNode
            .bind(Arethusa.fromNode)

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
            .bind(Arethusa.fromNode)
            .bind(Arethusa.reorderSentenceIds)
            .bind(Arethusa.reorderWordIds)
    }

    static fromXMLStr = (arethusaXML: string) => {
        return MaybeT.of(arethusaXML)
            .fmap(XML.fromXMLStr)
            .bind(XML.documentElement)
            .bind(Arethusa.fromNode)
    }

    static incrementSentenceIdsFrom = (startSentenceId: string) => (a: Arethusa) => {
        const reduceIncrement = (a: Maybe<Arethusa>, id: string) => {
            const s = a.bind(Arethusa.sentenceById(id))
            return s
                .bind(ArethusaSentence.incrementId)
                .bind(Arethusa.parentArethusa)
        }

        return Arethusa
            .nextSentenceIds(startSentenceId)(a)
            .reduce(reduceIncrement, MaybeT.of(a))
    }

    static insertSentence = 
        (insertFunc: (nodeToInsert: Node | Element | Text) => (refNode: Node) => Maybe<ParentNode>) => 
        (refSentenceId: string) => 
        (a: Arethusa) => 
    {

        const id = {"id": Str.increment(refSentenceId)}
        const sentenceElement = a
            .docCopy
            .fmap(XML.createElement("sentence")(id))

        const insertSentence = sentenceElement
            .fmap(insertFunc)

        const newArethusa = MaybeT.of(a)
            .bind(Arethusa.deepcopy)
            .bind(Arethusa.sentenceById(refSentenceId))
            .fmap(DXML.node)
            .applyBind(insertSentence)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(Arethusa.fromNode)

        return newArethusa.bind(Arethusa.reorderSentenceIds)    
    }

    static insertSentenceAfter = (refSentenceId: string) => (a: Arethusa): Maybe<Arethusa> => {
        return Arethusa.insertSentence(XML.insertAfter)(refSentenceId)(a)

    }

    static insertSentenceBefore = (refSentenceId: string) => (a: Arethusa): Maybe<Arethusa> => {
        return Arethusa.insertSentence(XML.insertBefore)(refSentenceId)(a)

    }

    static lastSentence(a: Arethusa): Maybe<Wordable> {
        return Arr.last (a.sentences)
    }

    static lastWord = (a: Arethusa) => {
        return MaybeT.of(a)
            .fmap(Arethusa.words)
            .bind(Arr.last)
    }

    static hasSentence = (sentenceId: string) => (a: Arethusa) => {
        const sentence = Arethusa.sentenceById (sentenceId) (a)
        return sentence.value !== Nothing.of().value
    }

    static newNextSentenceId(a: Arethusa) {
        return Arethusa
            .lastSentence(a)
            .bind(ArethusaSentence.id)
            .fmap(Str.increment)
            .unpack("1")
    }

    static nextWordId(arethusa: Arethusa) {
        const nextId = Arethusa
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
            .bind(Arethusa.fromNode)
    }

    get sentences(): ArethusaSentence[] {
        return Arethusa.sentences(this)
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
        (addFunc: (word: ArethusaWord) => (sentence: ArethusaSentence) => Maybe<Arethusa>) => 
        (wordId: string) => 
        (newSentenceId: string) =>
        (a: Arethusa) => {

        const currentWord = Arethusa
            .wordById(wordId)(a)

        const getThisSentence = currentWord
            .bind(ArethusaWord.parentSentenceId)
            .fmap(Arethusa.sentenceById)     

        const addWord = currentWord.fmap(addFunc)

        const newSentence = MaybeT.of(a)
            .bind(Arethusa.ensureSentence (newSentenceId))
            .bind(Arethusa.sentenceById (newSentenceId))
            
        const newArethusa = newSentence
            .applyBind(addWord)

        const thisSentence = newArethusa
            .bind(Arethusa.deepcopy)
            .applyBind(getThisSentence)   
                        
        const newArethusa2 = thisSentence
            .bind(ArethusaSentence.removeWordById(wordId))
        
        return newArethusa2
    }

    static moveWordToNextSentence = (wordId: string) => (a: Arethusa) => {
        const thisSentenceId = MaybeT.of(a)
            .bind(Arethusa.wordById(wordId))
            .bind(ArethusaWord.parentSentenceId)

        const nextSentenceId = thisSentenceId
            .fmap(Str.increment)

        const prependWordToNextSentence = nextSentenceId
            .fmap(Arethusa.pushWordToSentence (ArethusaSentence.prependWord) (wordId))

        return MaybeT.of(a).applyBind(prependWordToNextSentence)
    }

    static moveWordToPrevSentence = (wordId: string) => (a: Arethusa) => {
        const thisSentenceId = MaybeT.of(a)
            .bind(Arethusa.wordById(wordId))
            .bind(ArethusaWord.parentSentenceId)

        const prevSentenceId = thisSentenceId
            .fmap(Str.decrement)

        const appendWordToPrevSentence = prevSentenceId
            .fmap(Arethusa.pushWordToSentence (ArethusaSentence.appendWord) (wordId))

        return MaybeT.of(a)
            .applyBind(appendWordToPrevSentence)
    }

    static nextSentenceIds = (startSentenceId: string) => (a: Arethusa): string[] => {
        return Arethusa
            .sentenceById (startSentenceId) (a)
            .fmap(DXML.node)
            .bind(XML.nextSiblingElements)
            .unpackT([])
            .map(ArethusaSentence.fromXMLNode)
            .map(ArethusaSentence.id)
            .filter( (item: Maybe<string>) => item.isSomething ) 
            .map( (item: Maybe<string>) => item.value as string )
    }

    static _removeWordOrSentence = (id: string) => (a: Arethusa) => (entity: ArethusaWord | ArethusaSentence) => {
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
            .bind(Arethusa.fromNode)
    }

    static removeSentenceById = (id: string) => (a: Arethusa) => {
        return Arethusa
            .sentenceById (id) (a)
            .bind(Arethusa._removeWordOrSentence (id) (a))
    }

    static removeWordByWordAndSentenceId = (wordId: string) => (sentenceId: string) => (a: Arethusa) => {
        return ArethusaSentence
            .wordByWordAndSentenceId (wordId) (sentenceId) (a)
            .bind(Arethusa._removeWordOrSentence (wordId) (a))
    }

    static reorderSentenceIds = (a: Arethusa) => {
        const maybeSentences = MaybeT.of(a)
            .bind(Arethusa.deepcopy)
            .fmap(Arethusa.sentences)
            .unpackT([])
            .map( (s: ArethusaSentence, idx: number) => 
                MaybeT.of(DXML.node(s))
                    .fmap(XML.setId(Str.fromNum(idx + 1)))
                    .fmap(ArethusaSentence.fromXMLNode)
            )
        
        const sentences = Arr.removeNothings(maybeSentences)
        return Arethusa.fromSentences(sentences)
    }

    static reorderWordIds = (a: Arethusa): Maybe<Arethusa> => {
        const maybeWords = MaybeT.of(a)
            .bindErr("No Arethusa.", Arethusa.deepcopy)
            .fmapErr("No words in Arethusa.", Arethusa.words)
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
            .bindErr("No document element.", Arethusa.fromNode)
    }

    static replaceSentence = (a: Arethusa) => (newS: ArethusaSentence) => {

        const newSXML = DXML.node(newS)

        const sentenceNodes = Arethusa
            .deepcopy(a)
            .fmap(Arethusa.sentences)
            .unpackT([])
            .map(DXML.node)

        const newSentences = ArethusaSentence
            .id(newS)
            .fmap(flip(Arethusa.sentenceNodeIdxById)(a))
            .fmap(Arr.replaceByIdx(sentenceNodes)(newSXML))
            .unpackT([])
            .map(ArethusaSentence.fromXMLNode)

        return Arethusa.fromSentences(newSentences)

    }

    static sentences = (a: Arethusa) => {
        const getSentences = XML.xpath (ArethusaSentence.xpathAddress) 
        return MaybeT.of(a)
            .fmap(DXML.node)
            .bind(getSentences)
            .unpackT([])
            .map(ArethusaSentence.fromXMLNode)
    }

    static sentenceById = (id: string) => (a: Arethusa) => {
        const sentence = Arethusa
            .sentenceNodeById(id)(a)
            .fmap(ArethusaSentence.fromXMLNode)

        return sentence
    }

    static sentenceNodeById = (id: string) => (a: Arethusa) => {
        const sentence = XML
            .xpathMaybe(ArethusaSentence.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head)

        return sentence
    }

    static sentenceNodeIdxById = (id: string) => (a: Arethusa) => {
        return MaybeT.of(a)
            .fmap(Arethusa.sentences)
            .unpackT([])
            .map(DXML.node)
            .findIndex(
                (node: Node) => {
                    return XML.attrVal("id")(node).eq(id)
                }
            )
    }

    static sentenceByWordId = (id: string) => (a: Arethusa) => {
        const sentence = XML.xpathMaybe(ArethusaWord.parentSentenceAddress (id)) (a.doc)
            .bind(Arr.head)
            .fmap(ArethusaSentence.fromXMLNode)

        return sentence
    }

    static sentenceIdByWordId = (id: string) => (a: Arethusa) => {
        return Arethusa.sentenceByWordId (id) (a)
            .bind(ArethusaSentence.id)
    }

    static splitSentenceAt = (startWordId: string) => (a: Arethusa) => {

        const moveReduce = (_a: Maybe<Arethusa>, wordId: string) => {
            const newArethusa = _a.bind(Arethusa.deepcopy)
            return newArethusa.bind(Arethusa.moveWordToNextSentence(wordId))
        } 

        const nextWordIds = Arethusa
            .sentenceByWordId (startWordId) (a)
            .fmap(ArethusaSentence.nextWordIds (startWordId))
            .unpackT([])

        const currentSentenceId = Arethusa
            .sentenceIdByWordId(startWordId)(a)
        
        // const startForIncrement = currentSentenceId
        //     .fmap(Str.increment)
        //     .fmap(Str.increment)

        const insertSentence = MaybeT.of(a)
            .bind(Arethusa.sentenceIdByWordId(startWordId))
            .fmap(Arethusa.insertSentenceAfter)

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

    static toXMLStr(a: Arethusa) {
        return XML.toStr(a.node)
    }

    static words = (a: Arethusa) => {
        return Arethusa
            .sentences(a)
            .map(DXML.node)
            .flatMap(XML.childNodes)
            .filter( (node:Node) => node.nodeName === "word" )
            .map(ArethusaWord.fromXMLNode)
    }

    static wordById = (id: string) => (a: Arethusa) => {
        return XML.xpathMaybe(ArethusaWord.xpathAddress + `[@id='${id}']`)(a.doc)
            .bind(Arr.head)
            .fmap(ArethusaWord.fromXMLNode)
    }

    get wordsProp(): ArethusaWord[] {
        return Arethusa.words(this)
    }

}

