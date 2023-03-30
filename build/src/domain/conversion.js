class Conversion {
}
Conversion.epidocToArethusa = (epidoc) => {
    return MaybeT.of(epidoc)
        .fmap(EpiDoc.toXMLStr)
        .bind(Conversion.epidocXMLToArethusaXML)
        .bind(Arethusa.fromXMLStr);
};
Conversion.epidocXMLToArethusa = (epidocXML) => {
    return MaybeT.of(epidocXML)
        .bind(Conversion.epidocXMLToArethusaXML)
        .bind(Arethusa.fromXMLStr);
};
Conversion.epidocXMLToArethusaXML = (epidocXML) => {
    const epidoc = MaybeT.of(XML.fromXMLStr(epidocXML))
        .fmap(XMLFormatter.deprettifyFromRoot(true))
        .fmap(XML.toStr)
        .bind(EpiDoc.fromXMLStr);
    const docId = epidoc
        .bind(EpiDoc.filenameId)
        .unpackT("");
    const words = epidoc
        .fmap(EpiDoc.getEditions)
        .unpackT([])
        .flatMap(WordableT.words)
        .map(FormableT.form);
    const arethusa = Arethusa
        .fromXMLStr(arethusaTemplate)
        .bind(Arethusa.setDocId(docId))
        .bind(Arethusa.appendSentence)
        .bind(Arethusa.lastSentence)
        .bind(ArethusaSentence.appendMaybeWords(words));
    const arethusaXML = arethusa
        .fmap(DXML.node)
        .fmap(XMLFormatter.deprettifyFromRoot(true))
        .fmap(XMLFormatter.prettifyFromRoot(true))
        .bind(Arethusa.fromNode)
        .fmap(Arethusa.toXMLStr);
    return arethusaXML;
};
