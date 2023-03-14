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
        const doc = MaybeT.of(epidoc.node);
        return XML
            .xpathMaybe(Edition.xpathAddress)(doc)
            .fmap(EpiDoc.editionsFromArray).unpack([]);
    }
    get names() {
        return DXML.wordsFromXmlDoc(TEIName, MaybeT.of(this._node.ownerDocument));
    }
    get node() {
        return this._node;
    }
    static pushToFrontend(textStateIO) {
        var _a;
        const epidoc = textStateIO.epidoc;
        const xml = epidoc
            .fmap(EpiDoc.toXMLStr);
        if (xml.isNothing || ((_a = xml.value) === null || _a === void 0 ? void 0 : _a.includes("parsererror"))) {
            Frontend
                .epidocInputTextArea
                .applyFmap(MaybeT.of("[Not XML]").fmap(Frontend.updateTextArea));
            return;
        }
        Frontend
            .epidocInputTextArea
            .applyFmap(xml.fmap(Frontend.updateTextArea));
    }
    get text() {
        return MaybeT.of(this._node.textContent);
    }
    static toXMLStr(epidoc) {
        return XML.toStr(epidoc.node);
    }
    get wordsProp() {
        return DXML.wordsFromXmlDoc(TEIWord, MaybeT.of(this._node.ownerDocument));
    }
}
EpiDoc.deepcopy = (epidoc) => {
    return MaybeT.of(epidoc)
        .fmap(EpiDoc.toXMLStr)
        .bind(EpiDoc.fromXMLStr);
};
EpiDoc.editionsFromArray = map(Edition.of);
EpiDoc.namesFromArray = map(TEIName.of);
EpiDoc.TEIwordsFromArray = map(TEIWord.of);
