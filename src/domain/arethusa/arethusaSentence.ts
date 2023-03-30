
class ArethusaSentence implements Word, Wordable, Formable  {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    static appendWordToSentenceFromAttrs = (attrs: object) => (sentence: ArethusaSentence) => {
        const arethusa = ArethusaDoc
            .parentArethusa(sentence)
        const nextId = {"id": arethusa.fmap(ArethusaDoc.nextWordId).unpack("")}
        const createWordElement = XML
            .createElement("word")({...nextId, ...attrs})
        const wordElement = sentence
            .docCopy
            .fmap(createWordElement)
        const sentenceById = sentence._id
            .fmap(ArethusaDoc.sentenceById)

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
            .bind(ArethusaDoc.fromNode) 
    }

    static appendWord = (word: ArethusaWord) => (sentence: ArethusaSentence) => {
        const wordNode = DXML
            .node(word)
            .cloneNode(true)

        return MaybeT.of(DXML.node(sentence))
            .bind(XML.appendChildToNode(wordNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static prependWord = (word: ArethusaWord) => (sentence: ArethusaSentence) => {
        const wordNode = DXML
            .node(word)
            .cloneNode(true)

        return MaybeT.of(DXML.node(sentence))
            .fmap(XML.prependChildToNode(wordNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static appendMaybeWords = (words: Array<Maybe<string>>) => (s: ArethusaSentence): Maybe<ArethusaDoc> => {
        
        function _reduce (a: Maybe<ArethusaDoc>, item: Maybe<string>) {
            const getSent = ArethusaSentence
                .id(s)
                .fmap(ArethusaDoc.sentenceById)

            const appendWord = item
                .fmap(ArethusaWord.createFormDict)
                .fmap(ArethusaSentence.appendWordToSentenceFromAttrs)
                                    
            return a
                .applyBind(getSent)
                .applyBind(appendWord)
        }

        return words.reduce(_reduce, s.arethusa)
    }

    static appendWords = (words: Array<string>) => (s: ArethusaSentence): Maybe<ArethusaDoc> => {
        
        function _reduce (a: Maybe<ArethusaDoc>, item: string) {
            const getSent = ArethusaSentence
                .id(s)
                .fmap(ArethusaDoc.sentenceById)

            const appendWord = MaybeT.of(item)
                .fmap(ArethusaWord.createFormDict)
                .fmap(ArethusaSentence.appendWordToSentenceFromAttrs)
                                    
            return a
                .applyBind(getSent)
                .applyBind(appendWord)
        }

        return words.reduce(_reduce, s.arethusa)
    }

    get arethusa() {
        return this.doc
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    get doc(): Maybe<XMLDocument> {
        return MaybeT.of(this._node.ownerDocument)
    }

    get docCopy() {
        return this.doc.fmap(XML.deepcopy)
    }

    static firstWord(sentence: ArethusaSentence): Maybe<Formable> {
        return Arr.head (sentence.wordsProp)
    }

    static incrementId = (s: ArethusaSentence) => {
        const id = ArethusaSentence.id(s)
        const newId = id.fmap(Str.increment)
        const getSentence = id.fmap(ArethusaDoc.sentenceById)

        return s
            .docCopy
            .bind(ArethusaDoc.fromNode)
            .applyBind(getSentence)
            .fmap(DXML.node)
            .applyFmap(newId.fmap(XML.setId))
            .fmap(ArethusaSentence.fromXMLNode)
    }

    static lastWord(sentence: ArethusaSentence): Maybe<Formable> {
        return MaybeT.of(sentence)
            .fmap(ArethusaSentence.words)
            .bind(Arr.last)
    }

    static lastWordId = (sentence: ArethusaSentence) => {
        return MaybeT.of(sentence)
            .fmap(ArethusaSentence.words)
            .bind(Arr.last)
            .bind(ArethusaWord.id)
    }

    static XMLStrFromPlainTextStr = (a: ArethusaDoc) => (str: string): Maybe<Element> => {
        const sentenceElem = a
            .doc
            .fmapErr(
                "No XML document.", 
                XML.createElement("sentence")({id: ArethusaDoc.newNextSentenceId(a)})
            )

        const doc = MaybeT
            .of(a)
            .fmap(DXML.node)
            .bind(XML.ownerDocument)

        const createWord = doc.fmap(flip(XML.createElement("word"))).unpack(null)

        if (createWord === null) {
            console.error("create word function is null.")
            return sentenceElem
        }

        const wordElems = MaybeT.of(str)
            .fmapErr("Error with string.", Str.split(/[\s\t\n]/g))
            .unpackT([])
            .map(Str.strip)
            .map(ArethusaWord.createFormDict)
            .map(createWord)

        sentenceElem.fmap(XML.appendChildrenToNode(wordElems))

        return sentenceElem

    }

    static fromXMLNode = (node: Node) => {
        return new ArethusaSentence(node)
    }

    static id = (s: ArethusaSentence) => {
        return XML.attr ("id") (s._node)
            .bind(XML.nodeValue)
    }

    get _id() {
        return XML.attr ("id") (this._node)
            .bind(XML.nodeValue)
    }

    static moveWord = 
        (moveFunc: (nodeToInsert: Node | Element | Text) => (refNode: Node) => Maybe<ParentNode>) => 
        (id: string) => 
        (refNodeId: string) =>
        (sentence: ArethusaSentence) => {

        const wordNode = ArethusaSentence.wordById (id) (sentence)
            .fmap(DXML.node)
        const refNode = ArethusaSentence.wordById (refNodeId) (sentence)
            .fmap(DXML.node)

        const wordNodeCopy = wordNode.fmap(XML.deepcopy)

        const insertNode = wordNodeCopy
            .fmap(moveFunc)

        const newSentenceNode = refNode
            .applyBind(insertNode)

        return newSentenceNode
            .applyFmap(wordNode.fmap(XML.removeChild))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static moveWordDown = (wordId: string) => (sentence: ArethusaSentence) => {
        const wordNode = ArethusaSentence.wordById (wordId) (sentence)
            .fmap(DXML.node)

        const previousSibNodeId = wordNode
            .bind(XML.nextSibling)
            .bind(XML.attrVal("id"))

        const moveNode = previousSibNodeId.fmap(ArethusaSentence.moveWord(XML.insertAfter) (wordId))
        return MaybeT.of(sentence).applyBind(moveNode)
    }

    static moveWordUp = (wordId: string) => (sentence: ArethusaSentence) => {
        const wordNode = ArethusaSentence.wordById (wordId) (sentence)
            .fmap(DXML.node)

        const previousSibNodeId = wordNode
            .bind(XML.previousSibling)
            .bind(XML.attrVal("id"))

        const moveNode = previousSibNodeId.fmap(ArethusaSentence.moveWord(XML.insertBefore) (wordId))
        return MaybeT.of(sentence).applyBind(moveNode)
    }

    static nextWordIds = (startWordId: string) => (s: ArethusaSentence) => {
        return ArethusaSentence
            .wordById(startWordId) (s)
            .fmap(DXML.node)
            .bind(XML.nextSiblingElements)
            .unpackT([])
            .map(ArethusaWord.fromXMLNode)
            .map(ArethusaWord.id)
            .filter( (item: Maybe<string>) => item.isSomething ) 
            .map( (item: Maybe<string>) => item.value as string )
    }

    static removeWord = (word: ArethusaWord) => (sentence: ArethusaSentence) => {
        // Not working

        const wordNode = DXML.node(word)
        return MaybeT.of(DXML.node(sentence))
            .fmap(XML.removeChild(wordNode))
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    static removeWordById = (wordId: string) => (s: ArethusaSentence) => {
        const removeChild = ArethusaSentence
            .wordById (wordId) (s)
            .fmap(DXML.node)
            .fmap(XML.removeChild)
        
        return MaybeT.of(s)
            .fmap(DXML.node)
            .applyFmap(removeChild)
            .bind(XML.ownerDocument)
            .bind(XML.documentElement)
            .bind(ArethusaDoc.fromNode)
    }

    /**
     * Sets the document_id attribute of the <sentence> node.
     * Makes the change in place.
     * @param id string
     * @param sentence ArethusaSentence
     * @returns Maybe<ArethusaSentence>
     */
    static setDocId = (id: string) => (sentence: ArethusaSentence) => {
        return MaybeT.of(sentence)
            .fmap(DXML.node)
            .fmap(XML.setAttr('document_id')(id))
            .fmap(ArethusaSentence.fromXMLNode)
    }
    
    static toTreeSentState = (sentence: ArethusaSentence) => {
        const getTreeSentState = sentence._id
            .fmap(TreeState.ofTokens)
        
        return MaybeT.of(ArethusaSentence
            .treeTokens(sentence))
            .applyFmap(getTreeSentState)
    }

    static toTreeSentStateWithNodesFromExistingTree = 
        (nodes: ITreeNode[]) => 
        (sentence: ArethusaSentence) => 
        {
        // Nodes from existing tree supplied

        const getTreeSentState = sentence._id
            .fmap(TreeState.ofTokensWithExistingNodes(nodes))
        
        return MaybeT.of(ArethusaSentence
            .treeTokens(sentence))
            .applyFmap(getTreeSentState)
    }

    static treeTokens = (sentence: ArethusaSentence) => {
        return MaybeT.of(sentence)
            .fmap(ArethusaSentence.words)
            .unpackT([])
            .map(ArethusaWord.toTreeToken)
    }

    static wordByWordAndSentenceId = (wordId: string) => (sentenceId: string) => (a: ArethusaDoc) => {
        return MaybeT.of (ArethusaDoc
            .sentenceById (sentenceId) (a)
            .fmap(ArethusaSentence.words)
            .unpackT([])
            .find(ArethusaWord.matchId(wordId))
        )
    }

    static wordById = (wordId: string) => (sentence: ArethusaSentence) => {
        return $$ (MaybeT.of) (
            MaybeT.of (sentence)
                .fmap(ArethusaSentence.words)
                .unpackT([])
                .find(ArethusaWord.matchId(wordId))
        )
    }

    static wordIds = (s: ArethusaSentence) => {
        return ArethusaSentence
            .words(s)
            .map(ArethusaWord.id)
            .filter( (item: Maybe<string>) => item.isSomething ) 
            .map( (item: Maybe<string>) => item.value as string )
    }

    static words = (s: ArethusaSentence) => {
        return MaybeT.of(s)
            .fmap(DXML.node)
            .fmap(XML.childNodes)
            .fmap(ArethusaSentence.wordsFromNodes)
            .unpackT([])
    }

    static wordsFromNodes = (nodes: Node[]) => {
        return nodes
            .filter( (node:Node) => node.nodeName === "word" ) 
            .map(ArethusaWord.fromXMLNode)
    }

    get wordsProp(): ArethusaWord[] {
        return ArethusaSentence.words(this)
    }

    static get xpathAddress() { 
        return "descendant-or-self::treebank/sentence" 
    }

    static of(node: XMLNode): ArethusaSentence {
        return new ArethusaSentence(node)
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

}
