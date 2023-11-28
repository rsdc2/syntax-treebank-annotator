/**
 * Implements the Arethusa Artificial Token.
 * As a separate class from ArethusaArtificial this
 * is not used in this annotator.
 * It is implemented for comptatibility with
 * Arethusa.
 */

class ArethusaArtificial implements HasText {
    _node: Node
    _element: Element

    constructor(node: Node) {
        this._node = node
        this._element = DOM.Node_.element(node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return DOM.Elem.attributes(this._element)
    }

    static id = (w: ArethusaArtificial) => {
        return XML.attr ("id") (w._node)
            .bind(XML.nodeValue)
    }

    static form = (w: ArethusaArtificial) => {
        return XML.attr ("form") (w._node)
            .bind(XML.nodeValue)
    }

    get form(): Maybe<string> {
        return ArethusaToken.form(this)
    }

    static createAttrs = (form: string): IArtificial => {
        return {
            "form": form,
            "leiden": "",
            "artificial": "elliptic",
            "insertion_id": "",
            "relation": "",
            "head": "",
            "secdeps": ""
        }
    }

    static matchId = 
        (id: string) => 
        (word: ArethusaArtificial) => 
    {
        return ArethusaArtificial.id(word).unpack("") === id
    }

    static of(node: Node): ArethusaArtificial {
        return new ArethusaArtificial(node)
    }

    static fromAttrs = (a: ArethusaDoc) => (attrs: IArethusaWord) =>  {
        return a.doc
            .fmap(XML.createElement("word")(attrs))   
            .fmap(ArethusaArtificial.fromXMLNode)
    }

    static fromXMLNode = (node: Node) => {
        return new ArethusaArtificial(node)
    }

    static head = (w: ArethusaArtificial) => {
        return XML.attr ("head") (w._node)
            .bind(XML.nodeValue)
    }

    static parentSentenceAddress = (wordId: string) => {
        return `./treebank/sentence[child::word[@id="${wordId}"]]`
    }

    static parentSentence = (word: ArethusaArtificial) => {
        return MaybeT.of(DXML.node(word))
            .bind(XML.parent)
            .fmap(ArethusaSentence.fromXMLNode)
    }

    static parentSentenceId = (word: ArethusaArtificial) => {
        return ArethusaArtificial.parentSentence(word)
            .bind(ArethusaSentence.id)
    }

    static relation = (w: ArethusaArtificial) => {
        const rel = XML.attr ("relation") (w._node)
            .bind(XML.nodeValue)
            .fromMaybe("")

        if (rel === "") {
            return "" // Constants.defaultRel
        }

        return rel
    }

    static secondaryDeps = (w: ArethusaArtificial): ISecondaryDep[] => {
        const slashStr = XML.attr ("secdeps") (w._node)
            .bind(XML.nodeValue)
            .fromMaybe("")

        if (slashStr === "") return new Array<ISecondaryDep>

        const slashStrs = slashStr
            .split(";")

        return slashStrs.map(
            SecondaryDep.ofStr(
                ArethusaArtificial.id(w).fromMaybe("-1")
            )
        )
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    static toTreeToken = (w: ArethusaArtificial): ITreeArtificial => {
        return {
            form: ArethusaArtificial
                .form(w)
                .fromMaybe("[None]"),
            leiden: ArethusaArtificial
                .form(w)
                .fromMaybe("[None]"),
            headId: ArethusaArtificial
                .head(w)
                .bind(Str.toMaybeNum)
                .fromMaybe(-1),
            id: ArethusaArtificial
                .id(w)
                .fmap(Str.toNum)
                .fromMaybe(-1),
            artificial: "elliptical",
            insertionId: "",
            relation: ArethusaArtificial
                .relation(w),
            secondaryDeps: ArethusaArtificial
                .secondaryDeps(w),
            type: ArethusaArtificial
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
        return './treebank/sentence/word[@lemma]'
    }

}