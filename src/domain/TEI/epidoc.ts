interface TEIEditionable {
    editions: Wordable[]
}

type TEIFormNodeMeta = typeof TEIWord | typeof TEIName

class EpiDoc implements TEIEditionable, Wordable {
    _node: XMLNode

    constructor(epidocXML: string) {
        this._node = XML.fromXMLStr(epidocXML).documentElement
    }

    get editions(): Edition[] {
        return EpiDoc.getEditions(this)
    }

    static deepcopy = (epidoc: EpiDoc) => {
        return MaybeT.of(epidoc)
            .fmap(EpiDoc.toXMLStr)
            .bind(EpiDoc.fromXMLStr)
    }

    static editionsFromArray = map(Edition.of)

    static fromXMLStr(epidocXML: string) {
        return MaybeT.of(new EpiDoc(epidocXML))
    }

    static fromNode(node: Node) {
        return MaybeT.of(node)
            .fmap(XML.toStr)
            .bind(EpiDoc.fromXMLStr)
    }

    static getEditions(epidoc: EpiDoc) {
        const doc = MaybeT.of(epidoc.node)
        return XML
            .xpathMaybe (Edition.xpathAddress) (doc)
            .fmap(EpiDoc.editionsFromArray).unpack<Edition[]>([])
    }

    get names(): TEIName[] {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument))
    }

    static namesFromArray = map(TEIName.of)

    get node() {
        return this._node
    }

    static pushToFrontend(textStateIO: TextStateIO) {
        const epidoc = textStateIO.epidoc
        const xml = epidoc
            .fmap(EpiDoc.toXMLStr)

        if (xml.isNothing || xml.value?.includes("parsererror")) {
            Frontend
                .epidocInputTextArea
                .applyFmap( MaybeT.of("[Not XML]").fmap(Frontend.updateTextArea) )
            return 
        }

        Frontend
            .epidocInputTextArea
            .applyFmap( xml.fmap(Frontend.updateTextArea) )
    }

    static TEIwordsFromArray = map(TEIWord.of)

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    static toXMLStr(epidoc: EpiDoc) {
        return XML.toStr(epidoc.node)
    }

    get wordsProp(): TEIWord[] {
        return DXML.wordsFromXmlDoc(TEIWord, MaybeT.of(this._node.ownerDocument))
    }
}