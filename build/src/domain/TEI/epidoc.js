class EpiDoc {
    constructor(epidocXML) {
        this._node = XML.fromXMLStr(epidocXML).documentElement;
    }
    get editions() {
        return EpiDoc.getEditions(this);
    }
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
            .unpackT([]);
    }
    get names() {
        return DXML
            .wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument));
    }
    get node() {
        return this._node;
    }
    static pushToFrontend(textStateIO) {
        const xml = textStateIO
            .epidoc
            .fmap(EpiDoc.toXMLStr)
            .unpackT("");
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
EpiDoc.deepcopy = (epidoc) => {
    return MaybeT.of(epidoc)
        .fmap(EpiDoc.toXMLStr)
        .bind(EpiDoc.fromXMLStr);
};
EpiDoc.editionsFromArray = map(Edition.of);
EpiDoc.filenameId = (epidoc) => {
    const xpath = ".//t:publicationStmt/t:idno[@type='filename']/text()";
    return MaybeT.of(epidoc.node)
        .bind(XML.xpath(xpath))
        .bind(Arr.head)
        .bind(XML.nodeValue);
};
EpiDoc.namesFromArray = map(TEIName.of);
EpiDoc.TEIwordsFromArray = map(TEIToken.of);
