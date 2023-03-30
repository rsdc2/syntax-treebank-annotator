class ArethusaToken implements Formable {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    static id = (w: ArethusaToken) => {
        return XML.attr ("id") (w._node)
            .bind(XML.nodeValue)
    }

    static form = (w: ArethusaToken) => {
        return XML.attr ("form") (w._node)
            .bind(XML.nodeValue)
    }

    static createAttrs = (form: string): IArethusaToken => {
        return {
            "form": form,
            "relation": "",
            "head": "",
            "secdeps": ""
        }
    }

    static matchId = (id: string) => (word: ArethusaToken) => {
        return ArethusaToken
            .id(word)
            .unpack("") === id
    }

    static of(node: XMLNode): ArethusaToken {
        return new ArethusaToken(node)
    }

    static fromAttrs = (a: ArethusaDoc) => (attrs: IArethusaWord) =>  {
        return a.doc
            .fmap(XML.createElement("word")(attrs))   
            .fmap(ArethusaToken.fromXMLNode)
    }

    static fromXMLNode = (node: Node) => {
        return new ArethusaToken(node)
    }

    static head = (w: ArethusaToken) => {
        return XML.attr ("head") (w._node)
            .bind(XML.nodeValue)
    }

    static parentSentenceAddress = (wordId: string) => {
        return `./treebank/sentence[child::word[@id="${wordId}"]]`
    }

    static parentSentence = (word: ArethusaToken) => {
        return MaybeT.of(DXML.node(word))
            .bind(XML.parent)
            .fmap(ArethusaSentence.fromXMLNode)
    }

    static parentSentenceId = (word: ArethusaToken) => {
        return ArethusaToken
            .parentSentence(word)
            .bind(ArethusaSentence.id)
    }

    static relation = (w: ArethusaToken) => {
        const rel = XML.attr ("relation") (w._node)
            .bind(XML.nodeValue)
            .unpackT("")

        if (rel === "") {
            return "" // Constants.defaultRel
        }

        return rel
    }

    static secondaryDeps = (w: ArethusaToken) => {
        const secondaryDepStr = XML.attr ("secdeps") (w._node)
            .bind(XML.nodeValue)
            .unpackT("")

        if (secondaryDepStr === "") return new Array<ISecondaryDep>

        const secondaryDepStrs = secondaryDepStr
            .split(";")

        return secondaryDepStrs.map(
            Slash.ofStr(
                ArethusaToken.id(w).unpackT("-1")
            )
        )
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    static toTreeToken = (w: ArethusaToken): ITreeToken => {
        return {
            form: ArethusaToken
                .form(w)
                .unpackT("[None]"),
            headId: ArethusaToken
                .head(w)
                .bind(Str.toMaybeNum)
                .unpackT(-1),
            id: ArethusaToken
                .id(w)
                .fmap(Str.toNum)
                .unpackT(-1),
            lemma: "[None]",
            postag: "[None]",
            relation: ArethusaToken
                .relation(w),
            slashes: ArethusaToken
                .secondaryDeps(w),
            type: ArethusaToken
                .id(w).eq("0") ? 
                    TokenType.Root : 
                    TokenType.NonRoot,
        }
    }

    static get xpathAddress(): string {
        return "./treebank/sentence/word" 
    }

}