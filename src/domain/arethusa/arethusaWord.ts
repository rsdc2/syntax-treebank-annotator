class ArethusaWord implements HasText {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    static id = (w: ArethusaWord) => {
        return XML.attr ("id") (w._node)
            .bind(XML.nodeValue)
    }

    static form = (w: ArethusaWord): Maybe<string> => {
        return XML.attr ("form") (w._node)
            .bind(XML.nodeValue)
            .fmap(Str.replace(/\n/g)(""))
    }



    get form(): Maybe<string> {
        return ArethusaToken.form(this)
    }

    static createAttrs = (form: string): IArethusaWord => {
        return {
            "form": form,
            "leiden": "",
            "lemma": "",
            "postag": "",
            "relation": "",
            "head": "",
            "secdeps": "",
            "corpusId": ""
        }
    }

    static leiden = (w: ArethusaWord): Maybe<string> => {
        return XML.attr ("leiden") (w._node)
            .bind(XML.nodeValue)
            .fmap(Str.replace(/\n/g)(""))
    }

    static matchId = (id: string) => (word: ArethusaWord) => {
        return ArethusaWord.id(word).unpack("") === id
    }

    static of(node: HasXMLNode): ArethusaWord {
        return new ArethusaWord(node)
    }

    static fromAttrs = (a: ArethusaDoc) => (attrs: IArethusaWord) =>  {
        return a.doc
            .fmap(XML.createElement("word")(attrs))   
            .fmap(ArethusaWord.fromXMLNode)
    }

    static fromXMLNode = (node: Node) => {
        return new ArethusaWord(node)
    }

    static head = (w: ArethusaWord) => {
        return XML.attr ("head") (w._node)
            .bind(XML.nodeValue)
    }

    static lemma = (w: ArethusaWord) => {
        return XML.attr ("lemma") (w._node)
            .bind(XML.nodeValue)
    }

    static parentSentenceAddress = (wordId: string) => {
        return `./treebank/sentence[child::word[@id="${wordId}"]]`
    }

    static parentSentence = (word: ArethusaWord) => {
        return MaybeT.of(DXML.node(word))
            .bind(XML.parent)
            .fmap(ArethusaSentence.fromXMLNode)
    }

    static parentSentenceId = (word: ArethusaWord) => {
        return ArethusaWord.parentSentence(word)
            .bind(ArethusaSentence.id)
    }

    static postag = (w: ArethusaWord) => {
        return XML.attr ("postag") (w._node)
            .bind(XML.nodeValue)
    }

    static feats = (w: ArethusaWord) => {
        return XML.attr ("feats") (w._node)
            .bind(XML.nodeValue)
    }

    static relation = (w: ArethusaWord) => {
        const rel = XML.attr ("relation") (w._node)
            .bind(XML.nodeValue)
            .fromMaybe("")

        if (rel === "") {
            return "" // Constants.defaultRel
        }

        return rel
    }

    static slashes = (w: ArethusaWord) => {
        const slashStr = XML.attr ("secdeps") (w._node)
            .bind(XML.nodeValue)
            .fromMaybe("")

        if (slashStr === "") return new Array<ISecondaryDep>

        const slashStrs = slashStr
            .split(";")

        return slashStrs.map(
            SecondaryDep.ofStr(
                ArethusaWord.id(w).fromMaybe("-1")
            )
        )
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    static toTreeToken = (w: ArethusaWord): ITreeWord => {
        return {
            form: ArethusaWord
                .form(w)
                .fromMaybe("[None]"),
            leiden: ArethusaWord
                .form(w)
                .fromMaybe("[None]"),
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
        }
    }

    get corpusId(): string {
        return MaybeT.of(this._element.getAttribute("corpusId")).fromMaybe("")
    }

    static get xpathAddress(): string {
        return "./treebank/sentence/word" 
    }

}