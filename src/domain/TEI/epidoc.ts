interface TEIEditionable {
    editions: Wordable[]
}

type TEIFormNodeMeta = typeof TEIToken | typeof TEIName

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
        return MaybeT.of(epidoc.node)
            .bind(XML.xpath (Edition.xpathAddress))
            .fmap(EpiDoc.editionsFromArray)
            .unpackT([])
    }

    static filenameId = (epidoc: EpiDoc) => {
        const xpath = ".//t:publicationStmt/t:idno[@type='filename']/text()"

        return MaybeT.of(epidoc.node)
            .bind(XML.xpath (xpath))
            .bind(Arr.head)
            .bind(XML.nodeValue)
    }

    get names(): TEIName[] {
        return DXML
            .wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument))
    }

    static namesFromArray = map(TEIName.of)

    get node() {
        return this._node
    }

    static pushToFrontend(textStateIO: TextStateIO) {
        const xml = textStateIO
            .epidoc
            .fmap(EpiDoc.toXMLStr)
            .unpackT("")

        if (xml.includes("parsererror")) {
            Frontend
                .epidocInputTextArea
                .applyFmap( 
                    MaybeT.of("")
                        .fmap(Frontend.updateTextArea) 
                )

            Frontend.showMessage("EpiDoc input is not valid XML.")
            return 
        }

        Frontend
            .epidocInputTextArea
            .fmap( Frontend.updateTextArea(xml) )
    }

    static TEIwordsFromArray = map(TEIToken.of)

    get text() {
        return MaybeT.of(this._node.textContent)
    }

    static toXMLStr(epidoc: EpiDoc) {
        return XML.toStr(epidoc.node)
    }

    get tokens(): TEIToken[] {
        return DXML
            .wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument))
    }
}