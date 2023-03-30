class ArethusaWord implements Formable {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    static id = (w: ArethusaWord) => {
        return XML.attr ("id") (w._node)
            .bind(XML.nodeValue)
    }

    static form = (w: ArethusaWord) => {
        return XML.attr ("form") (w._node)
            .bind(XML.nodeValue)
    }

    static createAttrs = (form: string): IArethusaWord => {
        return {
            "form": form,
            "lemma": "",
            "postag": "",
            "relation": "",
            "head": "",
            "secdeps": ""
        }
    }

    static matchId = (id: string) => (word: ArethusaWord) => {
        return ArethusaWord.id(word).unpack("") === id
    }

    static of(node: XMLNode): ArethusaWord {
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

    static relation = (w: ArethusaWord) => {
        const rel = XML.attr ("relation") (w._node)
            .bind(XML.nodeValue)
            .unpackT("")

        if (rel === "") {
            return "" // Constants.defaultRel
        }

        return rel
    }

    static slashes = (w: ArethusaWord) => {
        const slashStr = XML.attr ("secdeps") (w._node)
            .bind(XML.nodeValue)
            .unpackT("")

        if (slashStr === "") return new Array<ISecondaryDep>

        const slashStrs = slashStr
            .split(";")

        return slashStrs.map(
            Slash.ofStr(
                ArethusaWord.id(w).unpackT("-1")
            )
        )
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    static toTreeToken = (w: ArethusaWord): ITreeToken => {
        return {
            form: ArethusaWord
                .form(w)
                .unpackT("[None]"),
            headId: ArethusaWord
                .head(w)
                .bind(Str.toMaybeNum)
                .unpackT(-1),
            id: ArethusaWord
                .id(w)
                .fmap(Str.toNum)
                .unpackT(-1),
            lemma: ArethusaWord
                .lemma(w)
                .unpackT("[None]"),
            postag: ArethusaWord
                .postag(w)
                .unpackT("[None]"),
            relation: ArethusaWord
                .relation(w),
            slashes: ArethusaWord
                .slashes(w),
            type: ArethusaWord
                .id(w).eq("0") ? 
                    TokenType.Root : 
                    TokenType.NonRoot,
        }
    }

    static get xpathAddress(): string {
        return "./treebank/sentence/word" 
    }

}