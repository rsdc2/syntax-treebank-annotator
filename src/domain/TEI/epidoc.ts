interface TEIEditionable {
    editions: HasToken[]
}

type TEIFormNodeMeta = typeof TEIToken | typeof TEIName

class EpiDoc implements TEIEditionable, HasToken {
    _node: HasXMLNode
    _element: Element

    constructor(epidocXML: string) {
        this._node = XML.fromXMLStr(epidocXML).documentElement
        this._element = DOM.Node_.element(this._node).fromMaybeErr()
    }

    get attrs(): NamedNodeMap {
        return this._element.attributes
    }

    static deepcopy = (epidoc: EpiDoc) => {
        return MaybeT.of(epidoc)
            .fmap(EpiDoc.toXMLStr)
            .bind(EpiDoc.fromXMLStr)
    }

    get editions(): Edition[] {
        return EpiDoc.getEditions(this)
    }

    static editionsFromArray = map(Edition.of)

    static fromXMLStr(epidocXML: string): Maybe<EpiDoc> {
        return MaybeT.of(EpiDoc.fromXMLStr_(epidocXML))
    }

    static fromXMLStr_(epidocXML: string): EpiDoc {
        return new EpiDoc(epidocXML)
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
            .fromMaybe([])
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
            .wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument)) as TEIName[]
    }

    static namesFromArray = map(TEIName.of)

    get node() {
        return this._node
    }

    static pushToFrontend(textStateIO: TextStateIO) {
        const xml = textStateIO
            .epidoc
            .fmap(EpiDoc.toXMLStr)
            .fromMaybe("")

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
            .wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument)) as TEIToken[]
    }
}