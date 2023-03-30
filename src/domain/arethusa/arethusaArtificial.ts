/**
 * Implements the Arethusa Artificial Token.
 * As a separate class from ArethusaArtificial this
 * is not used in this annotator.
 * It is implemented for comptatibility with
 * Arethusa.
 */

class ArethusaArtificial implements Formable {
    _node: Node

    constructor(node: Node) {
        this._node = node
    }

    static id = (w: ArethusaArtificial) => {
        return XML.attr ("id") (w._node)
            .bind(XML.nodeValue)
    }

    static form = (w: ArethusaArtificial) => {
        return XML.attr ("form") (w._node)
            .bind(XML.nodeValue)
    }

    static createFormDict = (form: string): IArtificial => {
        return {
            "form": form,
            "artificial": "elliptic",
            "insertion_id": "",
            "relation": "",
            "head": "",
            "secdeps": ""
        }
    }

    static matchId = (id: string) => (word: ArethusaArtificial) => {
        return ArethusaArtificial.id(word).unpack("") === id
    }

    static of(node: XMLNode): ArethusaArtificial {
        return new ArethusaArtificial(node)
    }

    static fromAttrs = (a: ArethusaDoc) => (attrs: IMorph) =>  {
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
            .unpackT("")

        if (rel === "") {
            return "" // Constants.defaultRel
        }

        return rel
    }

    static secondaryDeps = (w: ArethusaArtificial) => {
        const slashStr = XML.attr ("secdeps") (w._node)
            .bind(XML.nodeValue)
            .unpackT("")

        if (slashStr === "") return new Array<ISecondaryDep>

        const slashStrs = slashStr
            .split(";")

        return slashStrs.map(
            Slash.ofStr(
                ArethusaArtificial.id(w).unpackT("-1")
            )
        )
    }

    get text(): Maybe<string> {
        return MaybeT.of(this._node.textContent)
    }

    static toTreeToken = (w: ArethusaArtificial): ITreeToken => {
        return {
            form: ArethusaArtificial
                .form(w)
                .unpackT("[None]"),
            headId: ArethusaArtificial
                .head(w)
                .bind(Str.toMaybeNum)
                .unpackT(-1),
            id: ArethusaArtificial
                .id(w)
                .fmap(Str.toNum)
                .unpackT(-1),
            lemma: "[None]",
            postag: "[None]",
            relation: ArethusaArtificial
                .relation(w),
            slashes: ArethusaArtificial
                .secondaryDeps(w),
            type: ArethusaArtificial
                .id(w).eq("0") ? 
                    TokenType.Root : 
                    TokenType.NonRoot,
        }
    }

    static get xpathAddress(): string {
        return './treebank/sentence/word[@lemma]'
    }

}