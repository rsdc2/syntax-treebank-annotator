class EpiDoc {
    _node;
    _element;
    constructor(epidocXML) {
        this._node = XML.fromXMLStr(epidocXML).documentElement;
        this._element = DOM.Node_.element(this._node).fromMaybeErr();
    }
    get attrs() {
        return this._element.attributes;
    }
    static deepcopy = (epidoc) => {
        return MaybeT.of(epidoc)
            .fmap(EpiDoc.toXMLStr)
            .bind(EpiDoc.fromXMLStr);
    };
    get editions() {
        return EpiDoc.getEditions(this);
    }
    static editionsFromArray = map(Edition.of);
    static fromXMLStr(epidocXML) {
        return MaybeT.of(new EpiDoc(epidocXML));
    }
    static fromNode(node) {
        return MaybeT.of(node)
            .fmap(XML.toStr)
            .bind(EpiDoc.fromXMLStr);
    }
    static getEditions(epidoc) {
        return MaybeT.of(epidoc.node)
            .bind(XML.xpath(Edition.xpathAddress))
            .fmap(EpiDoc.editionsFromArray)
            .fromMaybe([]);
    }
    static filenameId = (epidoc) => {
        const xpath = ".//t:publicationStmt/t:idno[@type='filename']/text()";
        return MaybeT.of(epidoc.node)
            .bind(XML.xpath(xpath))
            .bind(Arr.head)
            .bind(XML.nodeValue);
    };
    get names() {
        return DXML
            .wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument));
    }
    static namesFromArray = map(TEIName.of);
    get node() {
        return this._node;
    }
    static pushToFrontend(textStateIO) {
        const xml = textStateIO
            .epidoc
            .fmap(EpiDoc.toXMLStr)
            .fromMaybe("");
        if (xml.includes("parsererror")) {
            Frontend
                .epidocInputTextArea
                .applyFmap(MaybeT.of("")
                .fmap(Frontend.updateTextArea));
            Frontend.showMessage("EpiDoc input is not valid XML.");
            return;
        }
        Frontend
            .epidocInputTextArea
            .fmap(Frontend.updateTextArea(xml));
    }
    static TEIwordsFromArray = map(TEIToken.of);
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static toXMLStr(epidoc) {
        return XML.toStr(epidoc.node);
    }
    get tokens() {
        return DXML
            .wordsFromXmlDoc(TEIToken, MaybeT.of(this._node.ownerDocument));
    }
}
