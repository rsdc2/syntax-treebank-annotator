class ArethusaToken implements HasText {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }
    
    static createAttrs = (form: string): IArethusaToken => {
        return {
            "form": form,
            "leiden": "",
            "relation": "",
            "head": "",
            "secdeps": "",
            "corpusId": ""
        }
    }

    static form = (w: ArethusaToken): Maybe<string> => {
        return XML.attr ("form") (w._node)
            .bind(XML.nodeValue)
    }

    get form(): Maybe<string> {
        return ArethusaToken.form(this)
    }

    static id = (w: ArethusaToken) => {
        return XML.attr ("id") (w._node)
            .bind(XML.nodeValue)
    }

    static isArtificial = (w: ArethusaToken): boolean => {
        return MaybeT.of(w)
            .fmap(DXML.isArtificial)
            .fromMaybe(false)
    }

    static leiden = (w: ArethusaToken): Maybe<string> => {
        return XML.attr ("leiden") (w._node)
            .bind(XML.nodeValue)
    }

    static matchId = (id: string) => (word: ArethusaToken) => {
        return ArethusaToken
            .id(word)
            .unpack("") === id
    }

    static of(node: HasXMLNode): ArethusaToken {
        if (XML.hasAttr('artificial')(node)) {
            return ArethusaArtificial.of(node)
        }
        return new ArethusaToken(node)
    }

    static fromAttrs = (a: ArethusaDoc) => (attrs: IArethusaWord) =>  {
        return a.doc
            .fmap(XML.createElement("word")(attrs))   
            .fmap(ArethusaToken.fromXMLNode)
    }

    static fromXMLNode = (node: Node) => {
        if (XML.hasAttr('artificial')) {
            return ArethusaArtificial.of(node)
        }
        return new ArethusaToken(node)
    }

    static head = (w: ArethusaToken) => {
        return XML.attr ("head") (w._node)
            .bind(XML.nodeValue)
    }
    
    static parentSentence = (word: ArethusaToken) => {
        return MaybeT.of(DXML.node(word))
            .bind(XML.parent)
            .fmap(ArethusaSentence.fromXMLNode)
    }
    
    static parentSentenceAddress = (wordId: string) => {
        return `./treebank/sentence[child::word[@id="${wordId}"]]`
    }

    static parentSentenceId = (word: ArethusaToken) => {
        return ArethusaToken
            .parentSentence(word)
            .bind(ArethusaSentence.id)
    }

    static relation = (w: ArethusaToken) => {
        const rel = XML.attr ("relation") (w._node)
            .bind(XML.nodeValue)
            .fromMaybe("")

        if (rel === "") {
            return "" // Constants.defaultRel
        }

        return rel
    }

    // Removes tokens with no text
    static removeEmptyTokens = (tokens: ArethusaToken[]): ArethusaToken[] => {
        return tokens
            .reduce( (acc: ArethusaToken[], token: ArethusaToken) => {
                if (token.form.unpack("") === "") {
                    return acc
                }
                return [...acc, token]
            }, new Array<ArethusaToken>())   
    }

    static secondaryDeps = (w: ArethusaToken) => {
        const secondaryDepStr = XML.attr ("secdeps") (w._node)
            .bind(XML.nodeValue)
            .fromMaybe("")

        if (secondaryDepStr === "") return new Array<ISecondaryDep>

        const secondaryDepStrs = secondaryDepStr
            .split(";")

        return secondaryDepStrs.map(
            SecondaryDep.ofStr(
                ArethusaToken.id(w).fromMaybe("-1")
            )
        )
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    static treeTokenType = (w: ArethusaToken): TreeTokenType => {
        if (ArethusaToken.id(w).eq("0")) {
            return TreeTokenType.Root
        }

        return TreeTokenType.NonRoot
    }

    static toTreeToken = (w: ArethusaToken): ITreeToken => {
        if (ArethusaToken.isArtificial(w)) {
            return ArethusaArtificial.toTreeToken(w)
        }
        return ArethusaWord.toTreeToken(w)
    }

    get corpusId(): string {
        return MaybeT.of(this._element.getAttribute("corpusId")).fromMaybe("")
    }

    static get xpathAddress(): string {
        return "./treebank/sentence/word" 
    }

}